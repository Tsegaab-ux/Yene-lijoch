from rest_framework import serializers
from .models import Notification

CATEGORY_MAP = {
    "video":      "videos",
    "event":      "events",
    "chat":       "chat",
    "lesson":     "curriculum",
    "student":    "groups",
    "parent":     "groups",
    "attendance": "attendance",
    "system":     "system",
}

class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="profile.get_full_name",
        read_only=True
    )
    category = serializers.SerializerMethodField()

    class Meta:

        model = Notification

        fields = (
            "id",
            "title",
            "message",
            "user_name",
            "category",
            "notification_type",
            "data",
            "is_read",
            "created_at",
            "read_at",
        )

        read_only_fields = fields

    def get_category(self, obj):
        return CATEGORY_MAP.get(obj.notification_type, "system")
    
