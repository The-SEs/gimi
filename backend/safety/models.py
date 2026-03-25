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
