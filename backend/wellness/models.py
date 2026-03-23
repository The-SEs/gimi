from django.db import models
from django.conf import settings

# Create your models here.


class DailyMood(models.Model):
    class MoodState(models.TextChoices):
        HAPPY = "HP", "Happy"
        SAD = "SD", "Sad"
        ANXIOUS = "AN", "Anxious"
        CALM = "CM", "Calm"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="moods"
    )
    date = models.DateField(auto_now_add=True)
    state = models.CharField(max_length=2, choices=MoodState.choices)

    class Meta:
        # Ensure user can only log one mood per day
        unique_together = ["user", "date"]

    def __str__(self):
        return f"{self.user.email} - {self.get_state_display()} on {self.date}"


class JournalEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journals"
    )
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Journal by {self.user.email} on {self.created_at.date()}"


class VectorDrawing(models.Model):
    # Link to the user who created the drawing
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="drawings"
    )

    title = models.CharField(max_length=255, blank=True)

    # The core field: Stores the X/Y coordinates, colors, strokes, etc., as raw JSON
    canvas_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Orders queries so the newest drawings always appear first
        ordering = ["-created_at"]

    def __str__(self):
        return f"Drawing by {self.user.email} on {self.created_at.date()}"
