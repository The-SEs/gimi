from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from datetime import timedelta, time
from .models import Consultation

User = get_user_model()

# Create your tests here.


class ConsultationAPITests(APITestCase):

    def setUp(self):
        self.student1 = User.objects.create_user(
            email="student1@iacademy.edu.ph",
            username="student1",
            password="password123",
        )
        self.student2 = User.objects.create_user(
            email="student2@iacademy.edu.ph",
            username="student2",
            password="password123",
        )
        self.admin_user = User.objects.create_superuser(
            email="admin@iacademy.edu.ph", username="admin", password="password123"
        )

        tomorrow = timezone.now() + timedelta(days=1)
        self.valid_time = timezone.make_aware(
            timezone.datetime.combine(tomorrow.date(), time(9, 0))
        )
        self.valid_time_2 = timezone.make_aware(
            timezone.datetime.combine(tomorrow.date(), time(10, 0))
        )

        self.consultation1 = Consultation.objects.create(
            student=self.student1,
            requested_date=self.valid_time,
            reason="Need help with models",
            mode_of_consultation=Consultation.ModeOfConsultation.ONLINE,
        )

        self.consultation2 = Consultation.objects.create(
            student=self.student2,
            requested_date=self.valid_time,
            reason="Need help with views",
            mode_of_consultation=Consultation.ModeOfConsultation.FACE_TO_FACE,
        )

        self.url = reverse("consultation-list")

    def test_student_can_only_view_own_consultations(self):
        self.client.force_authenticate(user=self.student1)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reason"], "Need help with models")
        self.assertEqual(response.data[0]["student"], self.student1.id)

    def test_admin_can_view_all_consultations(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_unauthenticated_user_cannot_view_consultations(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_create_consultation(self):
        self.client.force_authenticate(user=self.student1)

        future_date = timezone.now() + timedelta(days=2)
        valid_request_time = timezone.make_aware(
            timezone.datetime.combine(future_date.date(), time(11, 0))
        )

        data = {
            "requested_date": valid_request_time.isoformat(),
            "reason": "Final project discussion",
            "mode_of_consultation": "ON",
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Consultation.objects.count(), 3)

        self.assertEqual(response.data["student"], self.student1.id)
