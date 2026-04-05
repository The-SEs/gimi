from django.db import models
from pgvector.django import VectorField
from django.conf import settings

# Create your models here.
class HighRiskPhrase(models.Model):
    # The text
    text = models.CharField(max_length=500, unique=True)

    # embedded text dimension
    embedding = VectorField(dimensions=768)

    def __str__(self):
        return self.text

class SafetyFlag(models.Model):
    # Links to consumer model automatically
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='safety_flags')

    flagged_text = models.TextField()

    matched_phrases = models.JSONField(default=list)

    risk_level = models.CharField(max_length=20, default='High')

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Flag for {self.user.username} at {self.timestamp}"