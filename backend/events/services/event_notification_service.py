# notifications/services/event_notification_service.py
import logging

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from notifications.constants import NotificationType
from notifications.services.notification_service import NotificationService
from notifications.services.recipients import (
    admins_in_organization,
    parents_in_organization,
    teachers_in_organization,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class EventNotificationService:
    """
    Fan-out notifications for Event lifecycle events.

    Recipients by event:
      notify_new_event          : parents + teachers
      notify_event_published    : parents + teachers
      notify_event_rescheduled  : parents + teachers + org admins
      notify_event_cancelled    : parents + teachers + org admins

    The actor is always skipped so an admin creating an event doesn't
    get notified about their own action.
    """

    # ------------------------------------------------------------------
    # Recipient resolution
    # ------------------------------------------------------------------

    @classmethod
    def _recipients_for_event(
        cls,
        event,
        *,
        include_teachers=True,
        include_admins=False,
    ):
        """
        Single-query union of parent + teacher (+ optionally admin)
        querysets, all scoped to the event's organization.

        Returns (queryset, role_for) where `role_for(profile)` returns
        the role string to embed in the notification payload.
        """
        org = getattr(event, "organization", None)
        if not org:
            logger.warning(
                "event %s has no organization; no recipients", event.id,
            )
            return User.objects.none(), lambda _: "parent"

        parent_qs = parents_in_organization(org)
        teacher_qs = (
            teachers_in_organization(org)
            if include_teachers else User.objects.none()
        )
        admin_qs = (
            admins_in_organization(org)
            if include_admins else User.objects.none()
        )

        parent_ids = set(parent_qs.values_list("pk", flat=True))
        teacher_ids = set(teacher_qs.values_list("pk", flat=True))
        admin_ids = set(admin_qs.values_list("pk", flat=True))

        if not (parent_ids or teacher_ids or admin_ids):
            logger.info(
                "event %s: no recipients in org %s",
                event.id, org.id,
            )
            return User.objects.none(), lambda _: "parent"

        q = (
            Q(pk__in=parent_ids)
            | Q(pk__in=teacher_ids)
            | Q(pk__in=admin_ids)
        )
        recipients = User.objects.filter(q, is_active=True).distinct()

        def role_for(profile):
            if profile.pk in teacher_ids:
                return "teacher"
            if profile.pk in admin_ids:
                return "admin"
            return "parent"

        return recipients, role_for

    # ------------------------------------------------------------------
    # Internal dispatch
    # ------------------------------------------------------------------

    @staticmethod
    def _safe_create(**kwargs):
        try:
            return NotificationService.create(**kwargs)
        except Exception:
            logger.exception(
                "Failed to create event notification: user=%s type=%s",
                kwargs.get("user"),
                kwargs.get("notification_type"),
            )
            return None

    @classmethod
    def _fan_out(cls, recipients, *, actor, title, message, data, role_for=None):
        """
        One notification per recipient, actor excluded.

        `role_for(recipient)` — when provided — sets data["role"] per
        recipient so teachers and admins deep-link to the right route.
        Without it every recipient gets the same role.
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
                notification_type=NotificationType.EVENT,
                data=recipient_data,
            )
            if result is not None:
                sent += 1

        logger.info(
            "event notification fan-out: title=%r recipients=%d sent=%d",
            title, len(recipients), sent,
        )
        return sent

    @staticmethod
    def _when(event):
        """Human-readable 'when' string for the event body."""
        start = event.start_datetime
        if not start:
            return ""
        local = timezone.localtime(start) if timezone.is_aware(start) else start
        return local.strftime("%b %d, %Y · %I:%M %p").replace(" 0", " ")

    @staticmethod
    def _starts_at_iso(event):
        return (
            event.start_datetime.isoformat()
            if event.start_datetime else None
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def notify_new_event(cls, event, actor=None):
        """
        Fire when an event is created AND already published.
        Drafts rely on `notify_event_published` instead.
        """
        if not event.published:
            logger.info(
                "notify_new_event: event %s not published, skipping", event.id,
            )
            return 0

        recipients, role_for = cls._recipients_for_event(event)

        return cls._fan_out(
            recipients,
            actor=actor,
            title="New event",
            message=f"{event.title} — {cls._when(event)}"[:140],
            data={
                "event_id": event.id,
                "screen": "event",
                "reason": "new",
                "starts_at": cls._starts_at_iso(event),
            },
            role_for=role_for,
        )

    @classmethod
    def notify_event_published(cls, event, actor=None):
        """
        Fire when `published` flips False → True.
        Use INSTEAD of `notify_new_event` if you save drafts first.
        """
        recipients, role_for = cls._recipients_for_event(event)

        return cls._fan_out(
            recipients,
            actor=actor,
            title="Event published",
            message=f"{event.title} — {cls._when(event)}"[:140],
            data={
                "event_id": event.id,
                "screen": "event",
                "reason": "published",
                "starts_at": cls._starts_at_iso(event),
            },
            role_for=role_for,
        )

    @classmethod
    def notify_event_rescheduled(cls, event, old_start, old_end=None, actor=None):
        """
        Fire when start_datetime (or end_datetime) changes on a
        published event. Admins included — schedule drift is ops signal.
        """
        recipients, role_for = cls._recipients_for_event(
            event, include_admins=True,
        )

        return cls._fan_out(
            recipients,
            actor=actor,
            title="Event rescheduled",
            message=f"{event.title} moved to {cls._when(event)}"[:140],
            data={
                "event_id": event.id,
                "screen": "event",
                "reason": "rescheduled",
                "old_start": old_start.isoformat() if old_start else None,
                "new_start": cls._starts_at_iso(event),
            },
            role_for=role_for,
        )

    @classmethod
    def notify_event_cancelled(cls, event, actor=None):
        """
        Fire when an event is explicitly cancelled. Admins included.

        Requires either `event.status == "cancelled"` or a dedicated
        `is_cancelled` flag on the model — this method assumes the
        caller only invokes it on an actual cancellation transition.
        """
        recipients, role_for = cls._recipients_for_event(
            event, include_admins=True,
        )

        return cls._fan_out(
            recipients,
            actor=actor,
            title="Event cancelled",
            message=f"{event.title} has been cancelled"[:140],
            data={
                "event_id": event.id,
                "screen": "event",
                "reason": "cancelled",
            },
            role_for=role_for,
        )
    