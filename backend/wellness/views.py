from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Count
from django.db import IntegrityError
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.parsers import FormParser, MultiPartParser
from channels.layers import get_channel_layer
from .models import JournalEntry, UserMood, DailyMood, VectorDrawing, StudentTrack
from .serializers import (
    JournalEntrySerializer, UserMoodSerializer,
    DailyMoodSerializer, VectorDrawingSerializer, StudentTrackSerializer
)
from .services import analyze_mood, embed_drawing, get_drawing_emotional_analysis

from safety.services import check_journal
from safety.ai_utils import get_llama_response
from safety.models import SafetyFlag
from wellness.services import embed_drawing
from asgiref.sync import async_to_sync
import re

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


def get_smart_snippet(full_text, matched_phrase, window=50):
    """
    Finds the best part of the student's actual text to show in the pill.
    """
    text_lower = full_text.lower()

    # 1. Try to find the first word of the matched phrase (e.g., "kill")
    # This is usually the strongest part of the trigger.
    trigger_words = matched_phrase.lower().split()
    search_word = trigger_words[2] if len(trigger_words) > 2 else trigger_words[0]

    start_index = text_lower.find(search_word)

    # 2. If we can't find that word, just take the first part of their message
    if start_index == -1:
        return full_text[:window*2] + "..."

    # 3. Calculate the window around the actual word found in the student's text
    start_pos = max(0, start_index - window)
    end_pos = min(len(full_text), start_index + len(search_word) + window)

    snippet = full_text[start_pos:end_pos]

    if start_pos > 0: snippet = "..." + snippet
    if end_pos < len(full_text): snippet = snippet + "..."

    return snippet

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

            display_text = get_smart_snippet(content, matched_phrase)



            print(f"DEBUG: Saving this to the pill: {display_text}")

            SafetyFlag.objects.create(
                user=request.user,
                flagged_text=display_text,
                matched_phrases=[matched_phrase] if matched_phrase else [],
                risk_level="High"
            )
            _save_mood(entry)

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "guidance_alerts",
                {
                    "type": "safety_alert",
                    "status": "high_risk",
                    "user": request.user.username,
                    "message": "New flagged journal entry!"
                }
            )

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

            display_text = get_smart_snippet(content, matched_phrase)

            print(f"DEBUG: Saving this to the pill: {display_text}")


            SafetyFlag.objects.create(
                user=request.user,
                flagged_text=display_text,
                matched_phrases=[matched_phrase] if matched_phrase else [],
                risk_level="High"
            )
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

    #Adding extra stuff for drawing embeddings
    def perform_create(self, serializer):
        image_b64 = serializer.validated_data.get("image_b64","")
        embedding = embed_drawing(image_b64) if image_b64 else None

        # Get emotional analysis if image exists
        emotional_analysis = None
        if image_b64:
            try:
                analysis_text = get_drawing_emotional_analysis(image_b64)
                if analysis_text:
                    emotional_analysis = {"analysis": analysis_text}
            except Exception as e:
                print(f"Emotional analysis failed: {e}")

        serializer.save(user=self.request.user, embedding=embedding, emotional_analysis=emotional_analysis)


class VectorDrawingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VectorDrawingSerializer

    def get_queryset(self):
        return VectorDrawing.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        image_b64 = serializer.validated_data.get("image_b64", "")
        embedding = embed_drawing(image_b64) if image_b64 else None

        # Get emotional analysis if image exists
        emotional_analysis = serializer.instance.emotional_analysis
        if image_b64:
            try:
                analysis_text = get_drawing_emotional_analysis(image_b64)
                if analysis_text:
                    emotional_analysis = {"analysis": analysis_text}
            except Exception as e:
                print(f"Emotional analysis failed: {e}")

        serializer.save(embedding=embedding, emotional_analysis=emotional_analysis)

class StudentTrackListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentTrackSerializer
    permission_classes = [permissions.IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        # return music belonging to logged in user
        return StudentTrack.objects.filter(user=self.request.user).order_by('created_at')

    def perform_create(self, serializer):
        # automatically attach logged in user to new song
        serializer.save(user=self.request.user)

class StudentTrackDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        print(f"\n🔥 --- NUCLEAR DELETE TRIGGERED FOR ID: {pk} --- 🔥")

        # 1. Blindly check if it exists AT ALL in the entire database
        track = StudentTrack.objects.filter(id=pk).first()

        if not track:
            print("🚨 VERDICT: Ghost Track! It is completely missing from the database.")
            return Response({"error": "Track not found"}, status=404)

        # 2. Check if Matty actually owns it
        if track.user != request.user:
            print(f"🚨 VERDICT: Ownership mismatch! Song belongs to User ID {track.user.id}, but you are User ID {request.user.id}")
            return Response({"error": "Not your song!"}, status=403)

        # 3. If it passes both tests, destroy it
        print("✅ VERDICT: Song found and verified. Deleting now...")
        track.delete()
        return Response({"success": "Deleted!"}, status=204)