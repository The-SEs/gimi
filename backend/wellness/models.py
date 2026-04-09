from django.db import models
from django.conf import settings
from pgvector.django import VectorField
from users.models import CustomUser
from django.core.exceptions import ValidationError

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
    emotional_analysis = models.JSONField(null=True, blank=True)  # LLM emotional analysis
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Drawing by {self.user.email} on {self.created_at.date()}"

class StudentTrack(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='music_tracks')
    title = models.CharField(max_length=200)
    audio_file = models.FileField(upload_to='tracks/%Y/%m/%d/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class StudentPhoto(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        realted_name = "photos",
    )
    image = models.ImageField(upload_to = "student_photos/%Y/%m/%d/")
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def clean(self):
        if (
                StudentPhoto.objects.filter(user=self.user).count() >= 4
                and not self.pk
        ):
            raise ValidaitonError("Maximum of 4 photos only.")


    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Photo by {self.user.email} on {self.uploaded_at.date()}"
