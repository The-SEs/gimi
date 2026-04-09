# serializers.py
from rest_framework import serializers
from .models import JournalEntry, UserMood, DailyMood, VectorDrawing, StudentTrack, StudentPhoto
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
        fields = ["id", "title", "canvas_data", "image_b64", "emotional_analysis", "created_at", "updated_at"]
        read_only_fields = ["id", "emotional_analysis", "created_at", "updated_at"]
        extra_kwargs = {
            "image_b64" : {"write_only": True},
        }

class StudentTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTrack
        fields = ['id', 'title', 'audio_file', 'created_at']
        read_only_fields = ['id', 'created_at']

class StudentPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image = serializers.ImageField(write_only=True)

    class Meta:
        model = StudentPhoto
        fields = ["id", "image", "image_url", "caption", "uploaded_at"]

    def get_image_url(self, obj):
        import base64
        if obj.image_data:
            b64 = base64.b64encode(bytes(obj.image_data)).decode("utf-8")
            return f"data:{obj.mime_type};base64,{b64}"
        return None

    def create(self, validated_data):
        image_file = validated_data.pop("image")
        mime_type = image_file.content_type or "image/jpeg"
        image_data = image_file.read()
        return StudentPhoto.objects.create(
            image_data=image_data,
            mime_type=mime_type,
            **validated_data
        )
