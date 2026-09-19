from django.db import models


class NotificationType(models.TextChoices):
    VIDEO   = "video", "Video"
    EVENT   = "event", "Event"
    MESSAGE = "chat", "Chat"
    ATTENDANCE = "attendance", "Attendance"
    STUDENT = "student", "Student"
    LESSON  = "lesson", "Lesson"
    PARENT  = "parent", "Parent"
    SYSTEM  = "system", "System"
