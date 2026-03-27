from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Count
from django.db import IntegrityError
from django.utils import timezone

from .models import JournalEntry, UserMood, DailyMood, VectorDrawing
from .serializers import (
    JournalEntrySerializer, UserMoodSerializer,
    DailyMoodSerializer, VectorDrawingSerializer,
)
from .services import analyze_mood

from safety.services import check_journal
from safety.ai_utils import get_llama_response


def _save_mood(entry):
    result, raw = analyze_mood(entry.content)
    UserMood.objects.update_or_create(
        journal_entry=entry,
        defaults={
            "user": entry.user,
            "mood_label": result.get("mood_label", "neutral"),
            "confidence": result.get("confidence", 0.0),
            "summary": result.get("summary", ""),
            "raw_llm_response": raw,
        },
    )


# journal

class JournalListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user).select_related("mood")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Grab raw text
        content = serializer.validated_data.get('content', '')

        if not content:
            raise ValidationError({"content": "Journal cannot be empty"})

        # Run interceptor
        is_dangerous, matched_phrase, distance = check_journal(content)

        if is_dangerous:
            entry = serializer.save(
                user=request.user,
                is_flagged=True
            )

            _save_mood(entry)

            return Response({
                'status': 'high_risk',
                'message': "We noticed that you might be going through a tough time. Would you like to schedule a talk with the school counselor?",
                'id': entry.id,
                **serializer.data
            }, status=status.HTTP_201_CREATED)

        else:
            ai_reply = get_llama_response(content)

            entry = serializer.save(
                user=request.user,
                is_flagged=False,
                ai_chat_response=ai_reply
            )
            _save_mood(entry)

            return Response({
                'status': 'success',
                'message': 'Journal saved successfully',
                'ai_response': ai_reply,
                'id': entry.id,
                **serializer.data
            }, status=status.HTTP_201_CREATED)




class JournalDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user).select_related("mood")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Get the new content the user is trying to save
        content = serializer.validated_data.get('content', instance.content)

        if not content:
            raise ValidationError({"content": "Journal cannot be empty"})

        # 1. Run the safety interceptor on the updated text
        is_dangerous, matched_phrase, distance = check_journal(content)

        if is_dangerous:
            entry = serializer.save(is_flagged=True)
            _save_mood(entry)

            return Response({
                'status': 'high_risk',
                'message': "We noticed that you might be going through a tough time. Would you like to schedule a talk with the school counselor?",
                'id': entry.id,
                **serializer.data # <-- Sends back the full entry data for React
            }, status=status.HTTP_200_OK)

        else:
            # 2. Get the new AI response if it is safe
            ai_reply = get_llama_response(content)

            entry = serializer.save(
                is_flagged=False,
                ai_chat_response=ai_reply
            )
            _save_mood(entry)

            return Response({
                'status': 'success',
                'message': 'Journal updated successfully',
                'ai_response': ai_reply,
                'id': entry.id,
                **serializer.data # <-- Sends back the full entry data for React
            }, status=status.HTTP_200_OK)


# mood analyzed by ai from journal

class MoodListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMoodSerializer

    def get_queryset(self):
        return UserMood.objects.filter(user=self.request.user)


class MoodDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMoodSerializer

    def get_queryset(self):
        return UserMood.objects.filter(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def mood_latest(request):
    mood = UserMood.objects.filter(user=request.user).first()
    if not mood:
        return Response({"detail": "No mood data yet."}, status=404)
    return Response(UserMoodSerializer(mood).data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def mood_summary(request):
    moods = UserMood.objects.filter(user=request.user)
    breakdown = moods.values("mood_label").annotate(count=Count("id")).order_by("-count")
    return Response({"total": moods.count(), "breakdown": list(breakdown)})


# daily Mood (manual log)
class DailyMoodListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DailyMoodSerializer

    def get_queryset(self):
        return DailyMood.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        pass
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance, created = DailyMood.objects.update_or_create(
            user=request.user,
            date=timezone.now().date(),
            defaults={"state": serializer.validated_data["state"]},
        )

        output = DailyMoodSerializer(instance)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output.data, status=status_code)


# vector drawing

class VectorDrawingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VectorDrawingSerializer

    def get_queryset(self):
        return VectorDrawing.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class VectorDrawingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VectorDrawingSerializer

    def get_queryset(self):
        return VectorDrawing.objects.filter(user=self.request.user)
