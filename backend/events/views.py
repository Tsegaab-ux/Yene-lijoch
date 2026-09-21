# events/views.py
import logging

from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from organizations.utils import (
    get_user_organization,
    is_admin,
    is_superuser,
)

from .models import Event
from .serializers import (
    EventCreateSerializer,
    EventEditSerializer,
    EventSerializer,
)
from .services.event_notification_service import EventNotificationService

logger = logging.getLogger(__name__)


# ======================================================================
# Queryset + scope helpers
# ======================================================================

def base_queryset():
    return Event.objects.select_related("organization", "created_by")


def queryset_for_user(user):
    """
    Superusers → all events.
    Admins     → events in their organization.
    Others     → nothing (parents hit a separate read-only view).
    """
    qs = base_queryset()

    if is_superuser(user):
        return qs

    org = get_user_organization(user)
    if not org:
        return qs.none()

    return qs.filter(organization=org)


def apply_filters(qs, request):
    """
    ?status=upcoming
    ?published=true|false
    ?event_type=service
    ?year=2026
    ?upcoming=true
    """
    status_param = request.query_params.get("status")
    if status_param:
        qs = qs.filter(status=status_param)

    published = request.query_params.get("published")
    if published is not None:
        qs = qs.filter(published=published.lower() in ("1", "true", "yes"))

    event_type = request.query_params.get("event_type")
    if event_type:
        qs = qs.filter(event_type=event_type)

    year = request.query_params.get("year")
    if year:
        qs = qs.filter(start_datetime__year=year)

    upcoming = request.query_params.get("upcoming")
    if upcoming and upcoming.lower() in ("1", "true", "yes"):
        qs = qs.filter(start_datetime__gte=timezone.now())

    return qs


def enforce_org_scope(user, data, instance=None):
    """
    Non-superusers can only write events inside their own organization.
    `data` is the serializer's validated_data; `instance` is the
    existing event on edits.
    """
    if is_superuser(user):
        return

    org = get_user_organization(user)
    if not org:
        raise PermissionDenied("Your account is not linked to an organization.")

    target_org = data.get("organization") or getattr(instance, "organization", None)
    if target_org and target_org.id != org.id:
        raise PermissionDenied(
            "You can only manage events inside your own organization."
        )


# ======================================================================
# Notification side effects — the ONE place event triggers fire
# ======================================================================

def notify_side_effects(
    event,
    *,
    old_start,
    old_end,
    was_published,
    was_status,
    actor,
):
    """
    Fire notifications for state transitions between the snapshot and
    the current event. Branches are mutually exclusive — one save
    fires at most one notification.

    Priority:
      1. → cancelled          → notify_event_cancelled
      2. draft → live         → notify_event_published
      3. reschedule on a live event → notify_event_rescheduled

    Hidden and un-cancelled transitions are silent.
    """
    now_cancelled = event.status == Event.STATUS_CANCELLED
    was_cancelled = was_status == Event.STATUS_CANCELLED

    # 1. cancellation
    if not was_cancelled and now_cancelled:
        EventNotificationService.notify_event_cancelled(event, actor=actor)
        return

    # 2. draft → live
    if not was_published and event.published:
        EventNotificationService.notify_event_published(event, actor=actor)
        return

    # 3. reschedule on a live, non-cancelled event
    if (
        event.published
        and not now_cancelled
        and (old_start != event.start_datetime or old_end != event.end_datetime)
    ):
        EventNotificationService.notify_event_rescheduled(
            event, old_start=old_start, old_end=old_end, actor=actor,
        )
        
def _is_cancelled(event):
    """Event status is the single source of truth for cancellation."""
    return event.status == Event.STATUS_CANCELLED


def safe_notify(callable_, *args, **kwargs):
    """Never let a notification failure 500 the user's request."""
    try:
        return callable_(*args, **kwargs)
    except Exception:
        logger.exception("Event notification side effect failed")
        return None


# ======================================================================
# List + Create
# ======================================================================

class EventListCreateAPIView(APIView):
    """
    GET  /events/    → list, scoped to the user
    POST /events/    → create (admins only)
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ------------------------------------------------------------------
    def get(self, request):
        qs = queryset_for_user(request.user)
        qs = apply_filters(qs, request)
        return Response(
            EventSerializer(qs, many=True, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    def post(self, request):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to create events.")

        # Resolve the target org.
        if is_superuser(request.user):
            org = request.data.get("organization") or None
        else:
            org = get_user_organization(request.user)
            if not org:
                return Response(
                    {"detail": "You are not associated with an organization."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = EventCreateSerializer(
            data=request.data,
            context={"request": request, "organization": org},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        enforce_org_scope(request.user, serializer.validated_data)

        event = serializer.save()

        if hasattr(event, "created_by") and not event.created_by_id:
            event.created_by = request.user
            event.save(update_fields=["created_by", "updated_at"])

        # Only notify if it's created already-published. Drafts rely on
        # notify_event_published when toggled live.
        if event.published and not _is_cancelled(event):
            safe_notify(
                EventNotificationService.notify_new_event,
                event,
                actor=request.user,
            )

        return Response(
            EventSerializer(event, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# ======================================================================
# Detail: GET / PUT / PATCH / DELETE
# ======================================================================

class EventDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, request, pk):
        # 404 (not 403) when out of scope to avoid leaking existence.
        return get_object_or_404(queryset_for_user(request.user), pk=pk)

    def _require_admin(self, request):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify events.")

    # ------------------------------------------------------------------
    def get(self, request, pk):
        event = self.get_object(request, pk)
        return Response(
            EventSerializer(event, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, *, partial):
        self._require_admin(request)
        event = self.get_object(request, pk)

        # Snapshot before save so we can detect real transitions.
        old_start = event.start_datetime
        old_end = event.end_datetime
        was_published = event.published
        was_cancelled = _is_cancelled(event)

        serializer = EventEditSerializer(
            event,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        enforce_org_scope(request.user, serializer.validated_data, event)

        event = serializer.save()

        safe_notify(
            notify_side_effects,
            event,
            old_start=old_start,
            old_end=old_end,
            was_published=was_published,
            was_cancelled=was_cancelled,
            actor=request.user,
        )

        return Response(
            EventSerializer(event, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    def delete(self, request, pk):
        self._require_admin(request)
        event = self.get_object(request, pk)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ======================================================================
# Frontend-specific actions
# ======================================================================

class EventTogglePublishAPIView(APIView):
    """POST /events/<id>/toggle-publish/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify events.")

        event = get_object_or_404(queryset_for_user(request.user), pk=pk)

        old_start = event.start_datetime
        old_end = event.end_datetime
        was_published = event.published
        was_cancelled = _is_cancelled(event)

        event.published = not event.published
        event.save(update_fields=["published", "updated_at"])

        safe_notify(
            notify_side_effects,
            event,
            old_start=old_start,
            old_end=old_end,
            was_published=was_published,
            was_cancelled=was_cancelled,
            actor=request.user,
        )

        return Response(
            {"id": event.id, "published": event.published},
            status=status.HTTP_200_OK,
        )


class EventCancelAPIView(APIView):
    """POST /events/<id>/cancel/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify events.")

        event = get_object_or_404(queryset_for_user(request.user), pk=pk)

        if event.status == Event.STATUS_CANCELLED:
            return Response(
                {"id": event.id, "cancelled": True, "detail": "Already cancelled."},
                status=status.HTTP_200_OK,
            )

        old_start = event.start_datetime
        old_end = event.end_datetime
        was_published = event.published
        was_cancelled = False  # we just checked

        event.status = Event.STATUS_CANCELLED
        event.save(update_fields=["status", "updated_at"])

        safe_notify(
            notify_side_effects,
            event,
            old_start=old_start,
            old_end=old_end,
            was_published=was_published,
            was_cancelled=was_cancelled,
            actor=request.user,
        )

        return Response(
            {"id": event.id, "cancelled": True},
            status=status.HTTP_200_OK,
        )
    