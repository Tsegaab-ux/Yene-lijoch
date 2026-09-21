import logging

from notifications.services.notification_service import NotificationService
logger = logging.getLogger(__name__)
from notifications.constants import NotificationType


class ChatNotificationService:

    @staticmethod
    def _safe_create(**kwargs):
        """Never let notification failures break the main business action."""
        try:
            NotificationService.create(**kwargs)
        except Exception:
            # In production: log the exception (Sentry, structlog, etc.)
            logger.exception("Failed to create chat notification")

    @classmethod
    def notify_new_message(cls, conversation, message, sender_role):
        logger.info(
            "notify_new_message called: conversation=%s message=%s sender_role=%r",
            conversation.id, message.id, sender_role,
        )

        if sender_role == "teacher":
            recipient = conversation.parent.profile
        else:
            recipient = conversation.teacher.profile

        logger.info(
            "resolved recipient: user_id=%s (parent_profile=%s teacher_profile=%s)",
            recipient.id,
            getattr(conversation.parent, "profile_id", None),
            getattr(conversation.teacher, "profile_id", None),
        )

        cls._safe_create(
            user=recipient,
            title="New message",
            message=message.text[:140],
            notification_type=NotificationType.MESSAGE,
            data={"conversation_id": conversation.id, "screen": "chat"},
        )

        