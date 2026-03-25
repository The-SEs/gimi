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
        fields = ["id", "date", "state"]
        read_only_fields = ["id", "date"]

    def validate(self, attrs):
        user = self.context["request"].user
        today = timezone.now().date()
        if DailyMood.objects.filter(user=user, date=today).exists():
            raise serializers.ValidationError(
                {"detail": "You have already logged your mood for today."}
            )
        return attrs

class VectorDrawingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorDrawing
        fields = ["id", "title", "canvas_data", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
