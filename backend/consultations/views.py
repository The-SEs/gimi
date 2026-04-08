from users.permissions import IsStudent, IsCounselor
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .serializers import ConsultationSerializer
from .models import Consultation

class ConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationSerializer

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsStudent() | IsCounselor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not (IsStudent().has_permission(self.request, self) or 
                IsCounselor().has_permission(self.request, self)):
            raise PermissionDenied("You do not have access to consultations.")

        if IsCounselor().has_permission(self.request, self):
            return Consultation.objects.all().order_by("-requested_date")

        return Consultation.objects.filter(student=user).order_by("-requested_date")

    def perform_create(self, serializer):
        user = self.request.user

        if IsCounselor().has_permission(self.request, self):
            serializer.save()
        else:
            serializer.save(student=user)
