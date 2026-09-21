# attendance/services/attendance_notification_service.py
import logging

from django.contrib.auth import get_user_model

from notifications.constants import NotificationType
from notifications.services.notification_service import NotificationService

logger = logging.getLogger(__name__)
User = get_user_model()


class AttendanceService:

    @staticmethod
    def _safe_create(**kwargs):
        try:
            result = NotificationService.create(**kwargs)
            logger.info(
                "attendance notification created: id=%s user=%s type=%s",
                result.id, kwargs.get("user"), kwargs.get("notification_type"),
            )
            return result
        except Exception:
            logger.exception(
                "Failed to create attendance notification: user=%s type=%s",
                kwargs.get("user"), kwargs.get("notification_type"),
            )
            return None

    @staticmethod
    def _role_name(profile) -> str:
        role = getattr(profile, "role", None)
        if role is None:
            membership = getattr(profile, "organization", None)
            if membership is not None:
                role = getattr(membership, "role", None)
        if role is None:
            return "parent"
        if isinstance(role, str):
            return role or "parent"
        name = getattr(role, "role_name", None)
        return (name or "parent").lower()

    # ------------------------------------------------------------------
    # Recipients — parents of the student
    # ------------------------------------------------------------------

    @classmethod
    def _recipients_for_attendance(cls, attendance):
        """
        The Profile of every parent linked to the attendance's student.
        """
        student = getattr(attendance, "student", None)
        if not student:
            return User.objects.none()

        # Student.parents (M2M to Parent) → Parent.profile (FK to Profile)
        parent_ids = (
            student.parents
            .values_list("profile_id", flat=True)
            .distinct()
        )
        return User.objects.filter(pk__in=parent_ids, is_active=True).distinct()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def notify_new_attendance(cls, attendance, actor=None):
        student = getattr(attendance, "student", None)
        if not student:
            logger.warning(
                "notify_new_attendance: attendance %s has no student", attendance.id,
            )
            return 0

        recipients = cls._recipients_for_attendance(attendance)
        total = recipients.count()
        logger.info(
            "notify_new_attendance: attendance=%s student=%s recipients=%d",
            attendance.id, student.id, total,
        )

        if total == 0:
            logger.warning(
                "notify_new_attendance: no parents for student %s", student.id,
            )
            return 0

        actor_id = getattr(actor, "pk", None)

        student_name = (
            student.profile.get_full_name() if student.profile_id else "Your child"
        ).strip() or "Your child"

        title = "Attendance recorded"
        preview = (
            f"{student_name} was marked "
            f"{attendance.get_status_display().lower()} "
            f"for {attendance.lesson.title}"
        )[:140]

        sent = 0
        for recipient in recipients:
            if actor_id and recipient.pk == actor_id:
                continue

            result = cls._safe_create(
                user=recipient,
                title=title,
                message=preview,
                notification_type=NotificationType.ATTENDANCE,
                data={
                    "attendance_id": attendance.id,
                    "lesson_id": attendance.lesson_id,
                    "student_id": attendance.student_id,
                    "classroom_id": attendance.lesson.classroom_id,
                    "status": attendance.status,
                    "screen": "attendance",
                    "role": cls._role_name(recipient),
                },
            )
            if result is not None:
                sent += 1

        logger.info("notify_new_attendance: sent=%d/%d", sent, total)
        return sent
    