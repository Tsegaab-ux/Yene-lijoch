from rest_framework import serializers
from .models import Notification

<<<<<<< HEAD
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
=======
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea

class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="profile.get_full_name",
        read_only=True
    )
<<<<<<< HEAD
    category = serializers.SerializerMethodField()
=======
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea

    class Meta:

        model = Notification

        fields = (
            "id",
            "title",
            "message",
            "user_name",
<<<<<<< HEAD
            "category",
=======
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
            "notification_type",
            "data",
            "is_read",
            "created_at",
            "read_at",
        )

<<<<<<< HEAD
        read_only_fields = fields

    def get_category(self, obj):
        return CATEGORY_MAP.get(obj.notification_type, "system")
    
=======
        read_only_fields = fields
>>>>>>> e131497ff92bbc8590f4d71e23171a74287196ea
