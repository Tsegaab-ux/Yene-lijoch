# lessons/services/lesson_notification_service.py
import logging

from django.contrib.auth import get_user_model
from django.db.models import Q

from notifications.constants import NotificationType
from notifications.services.notification_service import NotificationService

logger = logging.getLogger(__name__)
User = get_user_model()


class LessonNotificationService:
    """
    Fan-out notifications for Lesson lifecycle events.

    Recipients by event:
      - notify_new_lesson           : parents + classroom teacher
      - notify_lesson_this_week     : parents + classroom teacher
      - notify_lesson_rescheduled   : parents + classroom teacher + org admins
      - notify_lesson_published     : parents + classroom teacher

    The actor (whoever triggered the event) is always skipped, so an
    admin who creates a lesson doesn't notify themselves, and a teacher
    editing their own lesson doesn't get pinged either.
    """

    # ------------------------------------------------------------------
    # Recipient helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parents_for_classroom(classroom):
        """
        Parents whose child is in `classroom`.

        Traversal (adjust to your final model):
            ClassRoom.roster  →  Student
            Student.parents   →  Parent      (related_name="parents")
            Parent.profile    →  Profile     (AUTH_USER_MODEL)
        """
        if not classroom:
            logger.warning("_parents_for_classroom: no classroom supplied")
            return User.objects.none()

        return (
            User.objects
            .filter(
                parent_profile__student__classroom=classroom,
                is_active=True,
            )
            .distinct()
        )

    @staticmethod
    def _teacher_for_classroom(classroom):
        """
        The Profile of the classroom's assigned teacher, if any.

        Returns a queryset (0 or 1 rows) so it can be unioned with the
        parent and admin querysets.
        """
        if not classroom or not classroom.teacher_id:
            return User.objects.none()

        teacher = classroom.teacher
        profile = (
            getattr(teacher, "profile", None)
            or getattr(teacher, "teacher_profile", None)
        )
        if not profile:
            logger.warning(
                "_teacher_for_classroom: teacher %s has no linked Profile",
                teacher.pk,
            )
            return User.objects.none()

        return User.objects.filter(pk=profile.pk, is_active=True)

    @staticmethod
    def _admins_for_organization(organization):
        """
        Org admins / staff.

        Adjust `organization__role` to match your model — this assumes
        Profile.organization → OrganizationMembership → Organization,
        with a `role` field on the membership.
        """
        if not organization:
            return User.objects.none()

        return (
            User.objects
            .filter(
                organization__organization=organization,
                organization__role__in=["admin", "staff"],
                is_active=True,
            )
            .distinct()
        )

    @classmethod
    def _recipients_for_lesson(
        cls,
        lesson,
        *,
        include_teacher=True,
        include_admins=False,
    ):
        """
        Everyone who should hear about an event on `lesson`.

        Always includes parents of the classroom. Optionally includes
        the classroom's teacher and org admins. The actor is excluded
        later, inside `_fan_out`.
        """
        classroom = getattr(lesson, "classroom", None)
        if not classroom:
            logger.warning(
                "_recipients_for_lesson: lesson %s has no classroom", lesson.id,
            )
            return User.objects.none()

        q = Q(pk__in=cls._parents_for_classroom(classroom).values("pk"))

        if include_teacher:
            q |= Q(pk__in=cls._teacher_for_classroom(classroom).values("pk"))

        if include_admins and classroom.organization_id:
            q |= Q(pk__in=cls._admins_for_organization(
                classroom.organization
            ).values("pk"))

        return User.objects.filter(q, is_active=True).distinct()

    # ------------------------------------------------------------------
    # Internal dispatch
    # ------------------------------------------------------------------

    @staticmethod
    def _safe_create(**kwargs):
        """Never let notification failures break the main business action."""
        try:
            return NotificationService.create(**kwargs)
        except Exception:
            logger.exception(
                "Failed to create lesson notification: user=%s type=%s",
                kwargs.get("user"),
                kwargs.get("notification_type"),
            )
            return None

    @classmethod
    def _fan_out(cls, recipients, *, actor, title, message, data, role_for=None):
        """
        Send one notification per recipient.

        - `actor` is skipped so the initiator doesn't notify themselves.
        - `role_for` (optional) maps a recipient to a role string, which
          is merged into the payload's `data["role"]`. Without it, every
          recipient gets the same role, which sends teachers to the
          parent route.
        """
        actor_id = getattr(actor, "pk", None)
        sent = 0

        for recipient in recipients:
            if actor_id and recipient.pk == actor_id:
                continue

            recipient_data = dict(data)
            if role_for is not None:
                recipient_data["role"] = role_for(recipient)

            result = cls._safe_create(
                user=recipient,
                title=title,
                message=message,
                notification_type=NotificationType.LESSON,
                data=recipient_data,
            )
            if result is not None:
                sent += 1

        logger.info(
            "lesson notification fan-out: title=%r recipients=%d sent=%d",
            title, len(recipients), sent,
        )
        return sent

    # ------------------------------------------------------------------
    # Role resolution
    # ------------------------------------------------------------------

    @staticmethod
    def _role_resolver(lesson, *, include_admins=False):
        """
        Build a `role_for(recipient)` closure by computing three sets
        once, then just checking membership per recipient.

        This avoids running a per-recipient query for `hasattr(profile,
        "teacher_profile")`, which would be N+1.
        """
        classroom = lesson.classroom

        parent_ids = set(
            LessonNotificationService
            ._parents_for_classroom(classroom)
            .values_list("pk", flat=True)
        )
        teacher_ids = set(
            LessonNotificationService
            ._teacher_for_classroom(classroom)
            .values_list("pk", flat=True)
        )
        admin_ids = set()
        if include_admins and classroom.organization_id:
            admin_ids = set(
                LessonNotificationService
                ._admins_for_organization(classroom.organization)
                .values_list("pk", flat=True)
            )

        def role_for(profile):
            if profile.pk in teacher_ids:
                return "teacher"
            if profile.pk in admin_ids:
                return "admin"
            # Parents are the default; unknown recipients fall back here
            # so the deep link still resolves somewhere.
            return "parent"

        return role_for

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def notify_new_lesson(cls, lesson, actor=None):
        """
        Fire when a Lesson is first created AND already published.

        If you save drafts, rely on `notify_lesson_published` instead —
        otherwise parents get pinged on every edit of a draft.
        """
        if not lesson.published:
            logger.info(
                "notify_new_lesson: lesson %s not published, skipping",
                lesson.id,
            )
            return 0

        recipients = cls._recipients_for_lesson(lesson)

        title = "New lesson available"
        preview = (lesson.title or "")[:140]

        return cls._fan_out(
            recipients,
            actor=actor,
            title=title,
            message=preview,
            data={
                "lesson_id": lesson.id,
                "classroom_id": lesson.classroom_id,
                "screen": "lesson",
                "reason": "new",
            },
            role_for=cls._role_resolver(lesson),
        )

    @classmethod
    def notify_lesson_this_week(cls, lesson, actor=None):
        """
        Fire when a lesson is flagged as this week's lesson.

        High signal: every parent in the classroom should know what
        their child is studying, and the teacher should know it's live.
        """
        recipients = cls._recipients_for_lesson(lesson)

        title = "This week's lesson"
        preview = (lesson.title or "")[:140]

        return cls._fan_out(
            recipients,
            actor=actor,
            title=title,
            message=preview,
            data={
                "lesson_id": lesson.id,
                "classroom_id": lesson.classroom_id,
                "screen": "lesson",
                "reason": "this_week",
            },
            role_for=cls._role_resolver(lesson),
        )

    @classmethod
    def notify_lesson_rescheduled(cls, lesson, old_date, actor=None):
        """
        Fire when `lesson_date` changes on an already-published lesson.

        Admins get this too — schedule changes are operational signal.
        """
        recipients = cls._recipients_for_lesson(lesson, include_admins=True)

        title = "Lesson rescheduled"
        new_label = lesson.date_label or str(lesson.lesson_date)
        message = f"{lesson.title} moved to {new_label}"[:140]

        return cls._fan_out(
            recipients,
            actor=actor,
            title=title,
            message=message,
            data={
                "lesson_id": lesson.id,
                "classroom_id": lesson.classroom_id,
                "screen": "lesson",
                "reason": "rescheduled",
                "old_date": str(old_date) if old_date else None,
                "new_date": str(lesson.lesson_date) if lesson.lesson_date else None,
            },
            role_for=cls._role_resolver(lesson, include_admins=True),
        )

    @classmethod
    def notify_lesson_published(cls, lesson, actor=None):
        """
        Fire when `published` flips False → True.

        Use INSTEAD of `notify_new_lesson` if you save drafts first.
        """
        recipients = cls._recipients_for_lesson(lesson)

        title = "Lesson published"
        preview = (lesson.title or "")[:140]

        return cls._fan_out(
            recipients,
            actor=actor,
            title=title,
            message=preview,
            data={
                "lesson_id": lesson.id,
                "classroom_id": lesson.classroom_id,
                "screen": "lesson",
                "reason": "published",
            },
            role_for=cls._role_resolver(lesson),
        )
    