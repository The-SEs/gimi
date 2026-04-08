from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsAdminRole, IsCounselor
from .models import SafetyFlag

class AdminSafetyFlagsView(APIView):
    persmission_classes = [IsAdminRole, IsCounselor]

    def get(self, request):
        flags = SafetyFlag.objects.select_related('user').order_by('-timestamp')

        data = []
        for flag in flags:
            data.append({
                "id": flag.id,
                "user_name": flag.user.username,
                "user_email": flag.user.email,
                "flagged_text": flag.flagged_text,
                "matched_phrases": flag.matched_phrases,
                "risk_level": flag.risk_level,
                "timestamp": flag.timestamp
            })

        return Response(data)
