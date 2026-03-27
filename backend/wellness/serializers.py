# serializers.py
from rest_framework import serializers
from .models import JournalEntry, UserMood, DailyMood, VectorDrawing
from django.utils import timezone

class UserMoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMood
        fields = ["id", "mood_label", "confidence", "summary", "raw_llm_response", "created_at"]

class JournalEntrySerializer(serializers.ModelSerializer):
    mood = UserMoodSerializer(read_only=True)
    class Meta:
        model = JournalEntry
        fields = ["id", "title", "content", "mood", "created_at", "updated_at", "is_flagged", "ai_chat_response"]
        read_only_fields = ["id", "mood", "created_at", "updated_at", "is_flagged", "ai_chat_response"]

class DailyMoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMood
        fields = ["id", "state", "date", "updated_at"]
        read_only_fields = ["id", "date", "updated_at"]

class VectorDrawingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorDrawing
        fields = ["id", "title", "canvas_data", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
