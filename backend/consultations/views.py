from rest_framework import viewsets, permissions
from .models import Consultation
from .serializers import ConsultationSerializer

# Create your views here.


class ConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return Consultation.objects.all().order_by("-requested_date")

        return Consultation.objects.filter(student=user).order_by("-requested_date")

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
