from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from datetime import timedelta, time
from users.permissions import IsStudent, IsNurse, IsCounselor, IsSecurity, IsAdminRole

from .models import Consultation

User = get_user_model()


def make_user(role, username, email, password="password123"):
    """Helper: create a user with a specific role."""
    user = User.objects.create_user(
        username=username, email=email, password=password
    )
    user.role = role
    user.save()
    return user


class ConsultationAPITests(APITestCase):

    def setUp(self):
        # ── users ─────────────────────────────────────────────────────────────
        self.student1  = make_user("STUDENT",   "student1",  "student1@iacademy.edu.ph")
        self.student2  = make_user("STUDENT",   "student2",  "student2@iacademy.edu.ph")
        self.counselor = make_user("COUNSELOR", "counselor", "counselor@iacademy.edu.ph")
        self.nurse     = make_user("NURSE",     "nurse1",    "nurse@iacademy.edu.ph")
        self.security  = make_user("SECURITY",  "security1", "security@iacademy.edu.ph")

        # ── seed consultations ────────────────────────────────────────────────
        tomorrow = timezone.now() + timedelta(days=1)
        self.valid_time   = timezone.make_aware(
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

    def _future_slot(self, days_ahead=2, hour=11):
        future = timezone.now() + timedelta(days=days_ahead)
        return timezone.make_aware(
            timezone.datetime.combine(future.date(), time(hour, 0))
        )

    def _detail_url(self, consultation):
        return reverse("consultation-detail", kwargs={"pk": consultation.pk})

    # ── list: GET /consultations/ ─────────────────────────────────────────────

    def test_student_can_only_view_own_consultations(self):
        """STUDENT sees only their own consultations."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reason"], "Need help with models")
        self.assertEqual(response.data[0]["student"], self.student1.id)

    def test_counselor_can_view_all_consultations(self):
        """COUNSELOR has full visibility over every consultation."""
        self.client.force_authenticate(user=self.counselor)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_nurse_cannot_view_consultations(self):
        """NURSE role must be blocked with 403."""
        self.client.force_authenticate(user=self.nurse)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_security_cannot_view_consultations(self):
        """SECURITY role must be blocked with 403."""
        self.client.force_authenticate(user=self.security)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_view_consultations(self):
        """Unauthenticated requests must be rejected with 401."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── create: POST /consultations/ ──────────────────────────────────────────

    def test_student_can_create_consultation(self):
        """STUDENT can book a consultation; student field is auto-assigned."""
        self.client.force_authenticate(user=self.student1)
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Final project discussion",
            "mode_of_consultation": "ON",
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Consultation.objects.count(), 3)
        self.assertEqual(response.data["student"], self.student1.id)

    def test_counselor_can_create_consultation_for_student(self):
        """COUNSELOR can create a consultation on behalf of a student."""
        self.client.force_authenticate(user=self.counselor)
        data = {
            "student":              self.student1.id,
            "requested_date":       self._future_slot(days_ahead=3, hour=14).isoformat(),
            "reason":               "Follow-up session",
            "mode_of_consultation": "FF",
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Consultation.objects.count(), 3)

    def test_nurse_cannot_create_consultation(self):
        """NURSE role must be blocked from creating consultations."""
        self.client.force_authenticate(user=self.nurse)
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Unauthorized attempt",
            "mode_of_consultation": "ON",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_security_cannot_create_consultation(self):
        """SECURITY role must be blocked from creating consultations."""
        self.client.force_authenticate(user=self.security)
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Unauthorized attempt",
            "mode_of_consultation": "ON",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_create_consultation(self):
        """Unauthenticated requests must be rejected with 401."""
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Should fail",
            "mode_of_consultation": "ON",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── detail: GET /consultations/<id>/ ─────────────────────────────────────

    def test_student_can_retrieve_own_consultation(self):
        """STUDENT can retrieve one of their own consultations."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get(self._detail_url(self.consultation1))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.consultation1.id)

    def test_student_cannot_retrieve_another_students_consultation(self):
        """STUDENT must not access another student's consultation — returns 404."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get(self._detail_url(self.consultation2))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_counselor_can_retrieve_any_consultation(self):
        """COUNSELOR can retrieve any student's consultation."""
        self.client.force_authenticate(user=self.counselor)
        for consultation in (self.consultation1, self.consultation2):
            response = self.client.get(self._detail_url(consultation))
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_nurse_cannot_retrieve_consultation(self):
        """NURSE role must be blocked from the detail view with 403."""
        self.client.force_authenticate(user=self.nurse)
        response = self.client.get(self._detail_url(self.consultation1))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_security_cannot_retrieve_consultation(self):
        """SECURITY role must be blocked from the detail view with 403."""
        self.client.force_authenticate(user=self.security)
        response = self.client.get(self._detail_url(self.consultation1))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── update: PUT/PATCH /consultations/<id>/ ───────────────────────────────

    def test_student_can_update_own_consultation(self):
        """STUDENT can update their own consultation."""
        self.client.force_authenticate(user=self.student1)
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Updated reason",
            "mode_of_consultation": "FF",
        }
        response = self.client.put(self._detail_url(self.consultation1), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reason"], "Updated reason")

    def test_student_cannot_update_another_students_consultation(self):
        """STUDENT must not update another student's consultation — returns 404."""
        self.client.force_authenticate(user=self.student1)
        data = {
            "requested_date":       self._future_slot().isoformat(),
            "reason":               "Malicious update",
            "mode_of_consultation": "ON",
        }
        response = self.client.put(self._detail_url(self.consultation2), data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_counselor_can_update_any_consultation(self):
        """COUNSELOR can update any student's consultation."""
        self.client.force_authenticate(user=self.counselor)
        data = {
            "requested_date":       self._future_slot(days_ahead=4).isoformat(),
            "reason":               "Rescheduled by counselor",
            "mode_of_consultation": "ON",
        }
        response = self.client.put(self._detail_url(self.consultation1), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reason"], "Rescheduled by counselor")

    # ── delete: DELETE /consultations/<id>/ ──────────────────────────────────

    def test_student_can_delete_own_consultation(self):
        """STUDENT can delete their own consultation."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.delete(self._detail_url(self.consultation1))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Consultation.objects.filter(pk=self.consultation1.pk).exists())

    def test_student_cannot_delete_another_students_consultation(self):
        """STUDENT must not delete another student's consultation — returns 404."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.delete(self._detail_url(self.consultation2))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_counselor_can_delete_any_consultation(self):
        """COUNSELOR can delete any consultation."""
        self.client.force_authenticate(user=self.counselor)
        response = self.client.delete(self._detail_url(self.consultation1))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
