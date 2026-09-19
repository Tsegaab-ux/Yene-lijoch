# lessons/views.py
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
    get_user_teacher,
    is_admin,
    is_superuser,
)

from .models import Lesson
from .serializers import (
    LessonCreateSerializer,
    LessonEditSerializer,
    LessonSerializer,
    LessonTeacherSerializer,
)
from .services.lesson_notification_service import LessonNotificationService

logger = logging.getLogger(__name__)


# ======================================================================
# Queryset + scoping helpers
# ======================================================================

def base_queryset():
    return Lesson.objects.select_related("classroom", "classroom__organization")


def queryset_for_user(user):
    """
    Superusers → all lessons.
    Admins     → only lessons in their organization.
    """
    qs = base_queryset()
    if is_superuser(user):
        return qs

    org = get_user_organization(user)
    if not org:
        return qs.none()

    return qs.filter(classroom__organization=org)


def scope_lessons_for_teacher(qs, user):
    """
    Teacher   → only lessons in their own classes.
    Admin     → only lessons in their org.
    Superuser → all.
    """
    if user.is_superuser:
        return qs

    teacher = get_user_teacher(user)
    if teacher:
        return qs.filter(classroom__teacher=teacher)

    org = get_user_organization(user)
    if not org:
        return qs.none()

    return qs.filter(classroom__organization=org)


def apply_filters(qs, request):
    """
    Optional query-string filters:

        ?status=this_week
        ?published=true|false
        ?year=2026
        ?week=5
        ?classroom=<id>
        ?category=Creation
    """
    status_param = request.query_params.get("status")
    if status_param:
        qs = qs.filter(status=status_param)

    published = request.query_params.get("published")
    if published is not None:
        qs = qs.filter(published=published.lower() in ("1", "true", "yes"))

    year = request.query_params.get("year")
    if year:
        qs = qs.filter(year=year)

    week = request.query_params.get("week")
    if week:
        qs = qs.filter(week=week)

    classroom = request.query_params.get("classroom")
    if classroom:
        qs = qs.filter(classroom_id=classroom)

    category = request.query_params.get("category")
    if category:
        qs = qs.filter(category__iexact=category)

    return qs


def check_org_scope(user, data, instance=None):
    """
    Module-level helper so both the list and detail views can use it
    without duplicating the logic. `data` is the serializer's
    validated_data; `instance` is the existing lesson on edits.
    """
    if is_superuser(user):
        return

    org = get_user_organization(user)
    if not org:
        raise PermissionDenied("Your account is not linked to an organization.")

    target_classroom = data.get("classroom") or getattr(instance, "classroom", None)
    if target_classroom and getattr(target_classroom, "organization_id", None) != org.id:
        raise PermissionDenied(
            "You can only manage lessons inside your own organization."
        )


# ======================================================================
# Notification side effects — the ONE place lesson events fire
# ======================================================================

def notify_side_effects(lesson, *, old_date, was_published, actor):
    """
    Fire notifications for state transitions.

    Called after every save path (create, patch, put, dedicated
    endpoints). Each trigger is guarded so we only notify on an actual
    transition:

      - draft → published         → notify_lesson_published
      - lesson_date changed       → notify_lesson_rescheduled
                                    (only when the lesson is live)

    Hiding a live lesson is silent (parents don't need to know it's
    hidden; it just disappears from their feed).
    """
    if not lesson.published:
        return

    # draft → live
    if not was_published and lesson.published:
        LessonNotificationService.notify_lesson_published(lesson, actor=actor)
        return

    # date change on a live lesson
    if old_date != lesson.lesson_date:
        LessonNotificationService.notify_lesson_rescheduled(
            lesson, old_date=old_date, actor=actor,
        )


def safe_notify(callable_, *args, **kwargs):
    """Never let a notification failure 500 the user's request."""
    try:
        return callable_(*args, **kwargs)
    except Exception:
        logger.exception("Notification side effect failed")
        return None


# ======================================================================
# List + Create
# ======================================================================

class LessonListCreateAPIView(APIView):
    """
    GET  /lessons/          → list, scoped to the user
    POST /lessons/          → create (admins only)
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        qs = queryset_for_user(request.user)
        qs = apply_filters(qs, request)
        serializer = LessonSerializer(
            qs, many=True, context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to create lessons.")

        serializer = LessonCreateSerializer(
            data=request.data, context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        check_org_scope(request.user, serializer.validated_data)

        lesson = serializer.save()

        # Notify only if it's created already-published.
        # A draft will fire notify_lesson_published when toggled live.
        if lesson.published:
            safe_notify(
                LessonNotificationService.notify_new_lesson,
                lesson,
                actor=request.user,
            )

        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# ======================================================================
# Detail: GET / PUT / PATCH / DELETE
# ======================================================================

class LessonDetailAPIView(APIView):
    """
    Superusers manage anything. Admins manage lessons in their org.
    Teachers can read their own class's lessons but not modify them
    (that's an intentional difference from admins).
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, request, pk):
        # 404 (not 403) when out of scope, to avoid leaking existence.
        return get_object_or_404(queryset_for_user(request.user), pk=pk)

    def _require_admin(self, request):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify lessons.")

    # ------------------------------------------------------------------
    def get(self, request, pk):
        lesson = self.get_object(request, pk)
        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, *, partial):
        self._require_admin(request)
        lesson = self.get_object(request, pk)

        # Snapshot the fields we care about BEFORE saving, so we can
        # detect real transitions after save.
        old_date = lesson.lesson_date
        was_published = lesson.published

        serializer = LessonEditSerializer(
            lesson,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        check_org_scope(request.user, serializer.validated_data, lesson)

        lesson = serializer.save()

        safe_notify(
            notify_side_effects,
            lesson,
            old_date=old_date,
            was_published=was_published,
            actor=request.user,
        )

        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    def delete(self, request, pk):
        self._require_admin(request)
        lesson = self.get_object(request, pk)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ======================================================================
# Frontend-specific actions
# ======================================================================

class LessonMakeThisWeekAPIView(APIView):
    """POST /lessons/<id>/make-this-week/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify lessons.")

        lesson = get_object_or_404(queryset_for_user(request.user), pk=pk)

        # Only notify on an actual transition into "this week".
        # A repeat tap (or setting an already-this-week lesson) is silent.
        was_this_week = lesson.status == Lesson.STATUS_THIS_WEEK
        lesson.mark_this_week()

        if not was_this_week:
            safe_notify(
                LessonNotificationService.notify_lesson_this_week,
                lesson,
                actor=request.user,
            )

        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class LessonTogglePublishAPIView(APIView):
    """POST /lessons/<id>/toggle-publish/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify lessons.")

        lesson = get_object_or_404(queryset_for_user(request.user), pk=pk)

        was_published = lesson.published
        published = lesson.toggle_published()

        # Only draft → live fires. Hiding is silent.
        if not was_published and published:
            safe_notify(
                LessonNotificationService.notify_lesson_published,
                lesson,
                actor=request.user,
            )

        return Response(
            {"id": lesson.id, "published": published},
            status=status.HTTP_200_OK,
        )


class LessonSetDateAPIView(APIView):
    """POST /lessons/<id>/set-date/  body: { lesson_date, date_label }"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not is_admin(request.user):
            raise PermissionDenied("You do not have permission to modify lessons.")

        lesson = get_object_or_404(queryset_for_user(request.user), pk=pk)

        lesson_date = request.data.get("lesson_date")
        if not lesson_date:
            return Response(
                {"lesson_date": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_date = lesson.lesson_date

        lesson.lesson_date = lesson_date
        lesson.date_label = request.data.get("date_label", "") or ""
        lesson.save(update_fields=["lesson_date", "date_label", "year", "updated_at"])

        if lesson.published and old_date != lesson.lesson_date:
            safe_notify(
                LessonNotificationService.notify_lesson_rescheduled,
                lesson,
                old_date=old_date,
                actor=request.user,
            )

        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


# ======================================================================
# Teacher-facing reads
# ======================================================================

class LessonTodayAPIView(APIView):
    """GET /lessons/today/"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            Lesson.objects
            .select_related("classroom")
            .order_by("lesson_date")
        )
        qs = scope_lessons_for_teacher(qs, request.user)

        today = timezone.localdate()

        this_week = (
            qs.filter(status=Lesson.STATUS_THIS_WEEK, published=True)
            .order_by("-lesson_date")
            .first()
        )

        upcoming = (
            qs.filter(published=True, lesson_date__gte=today)
            .exclude(status=Lesson.STATUS_COMPLETED)
            .order_by("lesson_date")
            .first()
        )

        next_lesson = upcoming
        if this_week and upcoming and this_week.id == upcoming.id:
            next_lesson = (
                qs.filter(published=True, lesson_date__gt=upcoming.lesson_date)
                .order_by("lesson_date")
                .first()
            )

        return Response({
            "lesson": (
                LessonTeacherSerializer(this_week, context={"request": request}).data
                if this_week else None
            ),
            "next": (
                LessonTeacherSerializer(next_lesson, context={"request": request}).data
                if next_lesson else None
            ),
        })


class LessonUpcomingAPIView(APIView):
    """GET /lessons/upcoming/?limit=10"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit", 10))
        except (TypeError, ValueError):
            limit = 10
        limit = max(1, min(limit, 50))

        qs = (
            Lesson.objects
            .select_related("classroom")
            .filter(published=True)
            .order_by("lesson_date")
        )
        qs = scope_lessons_for_teacher(qs, request.user)

        return Response(
            LessonTeacherSerializer(
                qs[:limit], many=True, context={"request": request},
            ).data
        )
    