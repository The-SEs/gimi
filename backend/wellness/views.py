from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Count
from django.db import transaction
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
from users.permissions import IsStudent, IsCounselor, IsAdminRole

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

# =======================================================
# Journal
# =======================================================

class JournalListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntrySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            return JournalEntry.objects.all().select_related("mood", "user")
        return JournalEntry.objects.filter(user=user).select_related("mood")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data.get('content', '')

        if not content:
            raise ValidationError({"content": "Journal cannot be empty"})

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
    serializer_class = JournalEntrySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            return JournalEntry.objects.all().select_related("mood", "user")
        return JournalEntry.objects.filter(user=user).select_related("mood")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        content = serializer.validated_data.get('content', instance.content)

        if not content:
            raise ValidationError({"content": "Journal cannot be empty"})

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
                **serializer.data 
            }, status=status.HTTP_200_OK)

        else:
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
                **serializer.data
            }, status=status.HTTP_200_OK)


# =======================================================
# Mood analyzed by AI from journal
# =======================================================

class MoodListView(generics.ListAPIView):
    serializer_class = UserMoodSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent | IsCounselor | IsAdminRole]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            student_id = self.request.query_params.get('student_id')
            if student_id:
                return UserMood.objects.filter(user__id=student_id)
            return UserMood.objects.all()
        return UserMood.objects.filter(user=user)


class MoodDetailView(generics.RetrieveAPIView):
    serializer_class = UserMoodSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent | IsCounselor | IsAdminRole]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            return UserMood.objects.all()
        return UserMood.objects.filter(user=user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsStudent | IsCounselor | IsAdminRole])
def mood_latest(request):
    if request.user.role in ['ADMIN', 'COUNSELOR']:
        student_id = request.query_params.get('student_id')
        if student_id:
            mood = UserMood.objects.filter(user__id=student_id).order_by('-id').first()
        else:
            return Response({"detail": "Please provide a student_id parameter."}, status=400)
    else:
        mood = UserMood.objects.filter(user=request.user).order_by('-id').first()

    if not mood:
        return Response({"detail": "No mood data yet."}, status=404)
    return Response(UserMoodSerializer(mood).data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated, IsStudent | IsCounselor | IsAdminRole])
def mood_summary(request):
    if request.user.role in ['ADMIN', 'COUNSELOR']:
        student_id = request.query_params.get('student_id')
        if student_id:
            moods = UserMood.objects.filter(user__id=student_id)
        else:
            return Response({"detail": "Please provide a student_id parameter."}, status=400)
    else:
        moods = UserMood.objects.filter(user=request.user)
        
    breakdown = moods.values("mood_label").annotate(count=Count("id")).order_by("-count")
    return Response({"total": moods.count(), "breakdown": list(breakdown)})


# =======================================================
# Daily Mood (manual log)
# =======================================================

class DailyMoodListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyMoodSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            student_id = self.request.query_params.get('student_id')
            if student_id:
                return DailyMood.objects.filter(user__id=student_id)
            return DailyMood.objects.all()
        return DailyMood.objects.filter(user=user)

    def perform_create(self, serializer):
        pass

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        state = serializer.validated_data["state"]
        user = request.user
        
        today = timezone.localdate()

        with transaction.atomic():
            obj, created = DailyMood.objects.update_or_create(
                user=user,
                date=today,
                defaults={"state": state}
            )

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(DailyMoodSerializer(obj).data, status=status_code)

# =======================================================
# Vector Drawing
# =======================================================

class VectorDrawingListCreateView(generics.ListCreateAPIView):
    serializer_class = VectorDrawingSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            student_id = self.request.query_params.get('student_id')
            if student_id:
                return VectorDrawing.objects.filter(user__id=student_id)
            return VectorDrawing.objects.all()
        return VectorDrawing.objects.filter(user=user)

    def perform_create(self, serializer):
        image_b64 = serializer.validated_data.get("image_b64","")
        embedding = embed_drawing(image_b64) if image_b64 else None

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
    serializer_class = VectorDrawingSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            return VectorDrawing.objects.all()
        return VectorDrawing.objects.filter(user=user)

    def perform_update(self, serializer):
        image_b64 = serializer.validated_data.get("image_b64", "")
        embedding = embed_drawing(image_b64) if image_b64 else None

        emotional_analysis = serializer.instance.emotional_analysis
        if image_b64:
            try:
                analysis_text = get_drawing_emotional_analysis(image_b64)
                if analysis_text:
                    emotional_analysis = {"analysis": analysis_text}
            except Exception as e:
                print(f"Emotional analysis failed: {e}")

        serializer.save(embedding=embedding, emotional_analysis=emotional_analysis)

# =======================================================
# Student Tracks (Music)
# =======================================================

class StudentTrackListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentTrackSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated(), (IsStudent | IsCounselor | IsAdminRole)()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COUNSELOR']:
            student_id = self.request.query_params.get('student_id')
            if student_id:
                return StudentTrack.objects.filter(user__id=student_id).order_by('created_at')
            return StudentTrack.objects.all().order_by('created_at')
        return StudentTrack.objects.filter(user=user).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StudentTrackDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def delete(self, request, pk):
        print(f"\n🔥 --- NUCLEAR DELETE TRIGGERED FOR ID: {pk} --- 🔥")

        track = StudentTrack.objects.filter(id=pk).first()

        if not track:
            print("🚨 VERDICT: Ghost Track! It is completely missing from the database.")
            return Response({"error": "Track not found"}, status=404)

        if track.user != request.user:
            print(f"🚨 VERDICT: Ownership mismatch! Song belongs to User ID {track.user.id}, but you are User ID {request.user.id}")
            return Response({"error": "Not your song!"}, status=403)

        print("✅ VERDICT: Song found and verified. Deleting now...")
        track.delete()
        return Response({"success": "Deleted!"}, status=204)
