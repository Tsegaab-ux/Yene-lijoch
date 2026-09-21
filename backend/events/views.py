<<<<<<< HEAD
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
=======
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea

from .models import Event
from .serializers import (
    EventCreateSerializer,
    EventEditSerializer,
    EventSerializer,
)
from .services.event_notification_service import EventNotificationService

<<<<<<< HEAD
logger = logging.getLogger(__name__)


# ======================================================================
# Queryset + scope helpers
# ======================================================================

def base_queryset():
    return Event.objects.select_related("organization", "created_by")
=======
from organizations.utils import (
    is_superuser,
    is_admin,
    get_user_organization,
    get_user_teacher,
)

# ======================================================================
# Queryset helpers
# ======================================================================
def can_manage_events(user):
    return is_admin(user) or get_user_teacher(user) is not None

def base_queryset():
    return Event.objects.select_related("organization")
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea


def queryset_for_user(user):
    """
    Superusers → all events.
<<<<<<< HEAD
    Admins     → events in their organization.
    Others     → nothing (parents hit a separate read-only view).
=======
    Admins     → only events belonging to their organization.
    Others     → nothing (parents will hit a separate read-only view).
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
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
<<<<<<< HEAD
    ?status=upcoming
    ?published=true|false
    ?event_type=service
    ?year=2026
    ?upcoming=true
=======
    Optional query-string filters used by the frontend:

        ?status=upcoming
        ?published=true|false
        ?event_type=service
        ?year=2026
        ?upcoming=true
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
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
<<<<<<< HEAD
=======
        from django.utils import timezone
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
        qs = qs.filter(start_datetime__gte=timezone.now())

    return qs


def enforce_org_scope(user, data, instance=None):
    """
<<<<<<< HEAD
    Non-superusers can only write events inside their own organization.
    `data` is the serializer's validated_data; `instance` is the
    existing event on edits.
=======
    Ensure a non-superuser can only write events inside their org.

    `data` may contain an `organization` key (from the create/edit
    serializer). If absent, we fall back to the instance's org.
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
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
<<<<<<< HEAD
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
=======
# List + Create  (superuser OR org-admin)
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
# ======================================================================

class EventListCreateAPIView(APIView):
    """
<<<<<<< HEAD
    GET  /events/    → list, scoped to the user
    POST /events/    → create (admins only)
=======
    GET  /events/
        Superuser → all events.
        Admin     → only events in their organization.

    POST /events/
        Create an event. The organization is injected from the
        authenticated user for non-superusers; superusers may pass
        `organization` explicitly.
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ------------------------------------------------------------------
    def get(self, request):
        qs = queryset_for_user(request.user)
        qs = apply_filters(qs, request)
<<<<<<< HEAD
        return Response(
            EventSerializer(qs, many=True, context={"request": request}).data,
            status=status.HTTP_200_OK,
=======

        serializer = EventSerializer(
            qs,
            many=True,
            context={"request": request},
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    def post(self, request):
<<<<<<< HEAD
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to create events.")

        # Resolve the target org.
=======
        if not can_manage_events(request.user):
            raise PermissionDenied("You do not have permission to create events.")

        # Determine the target organization.
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
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
<<<<<<< HEAD
            context={"request": request, "organization": org},
=======
            context={
                "request": request,
                "organization": org,
            },
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

<<<<<<< HEAD
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
=======
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Guard: non-superusers can only write inside their own org.
        enforce_org_scope(request.user, serializer.validated_data)

        event = serializer.save()

        # Record the creator when the model supports it.
        if hasattr(event, "created_by") and not event.created_by_id:
            event.created_by = request.user
            event.save(update_fields=["created_by", "updated_at"])

        response_serializer = EventSerializer(
            event,
            context={"request": request},
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# ======================================================================
# Detail: GET / PUT / PATCH / DELETE
# ======================================================================

class EventDetailAPIView(APIView):
<<<<<<< HEAD
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, request, pk):
        # 404 (not 403) when out of scope to avoid leaking existence.
        return get_object_or_404(queryset_for_user(request.user), pk=pk)

=======
    """
    GET    /events/<id>/
    PUT    /events/<id>/
    PATCH  /events/<id>/
    DELETE /events/<id>/

    Superusers can manage any event.
    Admins can only read/manage events inside their organization.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ------------------------------------------------------------------
    def get_object(self, request, pk):
        """
        Fetch an event the current user is allowed to see.
        Returns 404 (not 403) when out of scope so we don't leak the
        existence of other organizations' events.
        """
        qs = queryset_for_user(request.user)
        return get_object_or_404(qs, pk=pk)

>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
    def _require_admin(self, request):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify events.")

    # ------------------------------------------------------------------
    def get(self, request, pk):
        event = self.get_object(request, pk)
<<<<<<< HEAD
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
=======
        serializer = EventSerializer(
            event,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    def put(self, request, pk):
        self._require_admin(request)
        event = self.get_object(request, pk)
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea

        serializer = EventEditSerializer(
            event,
            data=request.data,
<<<<<<< HEAD
            partial=partial,
=======
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

<<<<<<< HEAD
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

=======
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        enforce_org_scope(request.user, serializer.validated_data, event)

        event = serializer.save()

        response_serializer = EventSerializer(
            event,
            context={"request": request},
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    def patch(self, request, pk):
        self._require_admin(request)
        event = self.get_object(request, pk)

        serializer = EventEditSerializer(
            event,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        enforce_org_scope(request.user, serializer.validated_data, event)

        event = serializer.save()

        response_serializer = EventSerializer(
            event,
            context={"request": request},
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
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
<<<<<<< HEAD
    """POST /events/<id>/toggle-publish/"""
=======
    """
    POST /events/<id>/toggle-publish/
    Frontend: publish / hide chip.
    """
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify events.")

        event = get_object_or_404(queryset_for_user(request.user), pk=pk)
<<<<<<< HEAD

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
=======
        published = event.toggle_published()

        return Response(
            {"id": event.id, "published": published},
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
            status=status.HTTP_200_OK,
        )
    