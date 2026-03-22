from django.db import models
from pgvector.django import VectorField

# Create your models here.
class HighRiskPhrase(models.Model):
    # The text
    text = models.CharField(max_length=500, unique=True)

    # embedded text dimension
    embedding = VectorField(dimensions=768)

    def __str__(self):
        return self.text

class JournalEntry(models.Model):
    content = models.TextField()

    is_flagged = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    ai_chat_response = models.TextField(blank=True, null=True)

    ai_summary = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Journal from {self.created_at.strftime('%Y-%m-%d')} (Flagged: {self.is_flagged})"

