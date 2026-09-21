# medias/services/medias_notification_service.py
import logging

from django.contrib.auth import get_user_model

from notifications.constants import NotificationType
from notifications.services.notification_service import NotificationService

logger = logging.getLogger(__name__)
User = get_user_model()


class MediasService:

    @staticmethod
    def _safe_create(**kwargs):
        """Never let a notification failure break the main business action."""
        try:
            result = NotificationService.create(**kwargs)
            logger.info(
                "media notification created: id=%s user=%s type=%s",
                result.id, kwargs.get("user"), kwargs.get("notification_type"),
            )
            return result
        except Exception:
            logger.exception(
                "Failed to create media notification: user=%s type=%s",
                kwargs.get("user"), kwargs.get("notification_type"),
            )
            return None

    # ------------------------------------------------------------------
    # Role extraction
    # ------------------------------------------------------------------

    @staticmethod
    def _role_name(profile) -> str:
        """
        Return a plain string suitable for a JSON payload.

        Checks Profile.role first, then membership.role. Handles both
        FK-to-Role and CharField layouts.
        """
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
    # Recipients
    # ------------------------------------------------------------------

    @classmethod
    def _recipients_for_media(cls, media):
        """
        Users in `media.organization` whose role is parent or teacher.
        Adjust the query to match your model.
        """
        if not media.organization_id:
            return User.objects.none()

        return (
            User.objects
            .filter(
                organization__organization=media.organization,
                role__role_name__in=["parent", "teacher"],
            )
            .distinct()
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def notify_new_media(cls, media, actor=None):
        if not media.organization_id:
            logger.warning("notify_new_media: media %s has no organization", media.id)
            return 0

        recipients = cls._recipients_for_media(media)
        total = recipients.count()
        logger.info(
            "notify_new_media: media=%s org=%s recipients=%d",
            media.id, media.organization_id, total,
        )

        if total == 0:
            logger.warning(
                "notify_new_media: no recipients for org %s — check the role filter",
                media.organization_id,
            )
            return 0

        actor_id = getattr(actor, "pk", None)
        kind_label = (
            media.get_kind_display()
            if hasattr(media, "get_kind_display") else media.kind
        )
        title = f"New {kind_label}"
        preview = (media.title or "")[:140]

        sent = 0
        for recipient in recipients:
            if actor_id and recipient.pk == actor_id:
                continue

            result = cls._safe_create(
                user=recipient,
                title=title,
                message=preview,
                notification_type=NotificationType.VIDEO,
                data={
                    "media_id": media.id,
                    "screen": "media",
                    "kind": media.kind,
                    "role": cls._role_name(recipient),
                },
            )
            if result is not None:
                sent += 1

        logger.info("notify_new_media: sent=%d/%d", sent, total)
        return sent
    