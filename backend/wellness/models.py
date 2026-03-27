from django.db import models
from django.conf import settings
from pgvector.django import VectorField

class DailyMood(models.Model):
    #manual daily mood log once a day
    class MoodState(models.TextChoices):
        HAPPY = "HP", "Happy"
        SAD = "SD", "Sad"
        ANXIOUS = "AN", "Anxious"
        CALM = "CM", "Calm"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="moods"
    )
    date = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    state = models.CharField(max_length=2, choices=MoodState.choices)



    class Meta:
        unique_together = ["user", "date"]

    def __str__(self):
        return f"{self.user.email} - {self.get_state_display()} updated at {self.updated_at}"


class JournalEntry(models.Model):
    #written journal entry trigger ai analysis on save hopefully
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journals"
    )
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_flagged = models.BooleanField(default=False)
    ai_chat_response = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Journal by {self.user.email} on {self.created_at.date()}"


class UserMood(models.Model):
    #mood analyzed by ai
    MOOD_CHOICES = [
        ("happy", "Happy"), ("sad", "Sad"), ("anxious", "Anxious"),
        ("calm", "Calm"), ("angry", "Angry"), ("neutral", "Neutral"),
        ("excited", "Excited"), ("stressed", "Stressed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journal_moods"
    )
    journal_entry = models.OneToOneField(
        JournalEntry, on_delete=models.CASCADE, related_name="mood"
    )
    mood_label = models.CharField(max_length=50, choices=MOOD_CHOICES)
    confidence = models.FloatField(default=0.0)
    summary = models.TextField(blank=True)
    raw_llm_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.mood_label} ({self.journal_entry})"


class VectorDrawing(models.Model):
    #canvas drawing
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="drawings"
    )
    title = models.CharField(max_length=255, blank=True)
    canvas_data = models.JSONField(default=dict)
    image_b64 = models.TextField(blank=True)
    embedding = VectorField(dimensions=512, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Drawing by {self.user.email} on {self.created_at.date()}"
