from users.permissions import IsStudent, IsCounselor
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from .serializers import ConsultationSerializer
from .models import Consultation

class ConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationSerializer

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), (IsStudent | IsCounselor)()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'COUNSELOR':
            return Consultation.objects.all().order_by("-requested_date")
        elif user.role == 'STUDENT':
            return Consultation.objects.filter(student=user).order_by("-requested_date")
        else:
            raise PermissionDenied("You do not have access to consultations.")

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == 'COUNSELOR':
            student_id = self.request.data.get('student')
            if not student_id:
                raise ValidationError({"student": "Student ID is required when booking as a counselor."})
            serializer.save(student_id=student_id)
        else:
            serializer.save(student=user)
