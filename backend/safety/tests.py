from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from safety.models import HighRiskPhrase, NurseLogEntry
from wellness.models import JournalEntry
from safety.services import check_journal
from users.models import CustomUser


class SafetyModelTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='student1',
            email = 'studentTest@iacademy.edu.ph',
            password = 'test1234',

        )

    def test_create_journal_entry(self):
        """Test to see if journal entry is created"""
        entry = JournalEntry.objects.create(
            user=self.user,
            content="I had a pretty normal day today",
            is_flagged=False
        )

        self.assertFalse(entry.is_flagged)


class SafetyServiceTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='student1',
            email='student2@iacademy.edu.ph',
            password='test1234'
        )

        self.risk_phrase = HighRiskPhrase.objects.create(
            text = "I want to kill myself",
            embedding=[0.1] * 768
        )

    @patch('safety.services.get_embedding')
    def test_check_journal_safe(self, mock_embed):
        """Test the vector check with a safe journal entry"""
        mock_embed.return_value = [-0.1] * 768

        is_dangerous, phrase, distance = check_journal("I had a pretty normal day today")

        self.assertFalse(is_dangerous)

    @patch('safety.services.get_embedding')
    def test_check_journal_dangerous(self, mock_embed):
        mock_embed.return_value = [0.1] * 768

        is_dangerous, phrase, distance = check_journal("I want to kill someone")

        self.assertTrue(is_dangerous)
        self.assertEqual(phrase, self.risk_phrase.text)
        self.assertLess(distance, 0.30)


class SafetyViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='student1',
            email='api@iacademy.edu.ph',
            password='test1234'
        )

        self.client.force_authenticate(user=self.user)
        # Pointing to the new consolidated wellness journal endpoint
        self.url = '/api/wellness/journals/'

    # We must patch where the functions are imported/used (wellness.views)
    @patch('wellness.views._save_mood')
    @patch('wellness.views.get_llama_response')
    @patch('wellness.views.check_journal')
    def test_view_handles_high_risk_logic(self, mock_check, mock_llama, mock_save_mood):
        # Tell mock check_journal to pretend it found a flagged phrase
        mock_check.return_value = (True, "I want to kill myself", 0.01)

        payload = {"title": "Bad Day", "content": "I am feeling very dark today."}
        response = self.client.post(self.url, payload, format='json')

        # Check API response (Changed to 201 CREATED based on your view's return status)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'high_risk')

        # Verify it saved to the database correctly
        entry = JournalEntry.objects.latest('id')
        self.assertTrue(entry.is_flagged)

        # AI response should never be called if it's high risk, but mood should be saved
        mock_llama.assert_not_called()
        mock_save_mood.assert_called_once()

    @patch('wellness.views._save_mood')
    @patch('wellness.views.get_llama_response')
    @patch('wellness.views.check_journal')
    def test_view_handles_safe_logic(self, mock_check, mock_llama, mock_save_mood):
        """Test that a safe journal passes through and gets an AI response"""

        # Make check_journal pretends it's safe
        mock_check.return_value = (False, "I am okay", 0.8)
        mock_llama.return_value = "I am glad that you are feeling well!"

        payload = {"title": "Good Day", "content": "Today, I went to the park."}
        response = self.client.post(self.url, payload, format="json")

        # Check API response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['ai_response'], "I am glad that you are feeling well!")

        # Verify it saved to the database correctly
        entry = JournalEntry.objects.latest('id')
        self.assertFalse(entry.is_flagged)
        self.assertEqual(entry.ai_chat_response, "I am glad that you are feeling well!")

        # Verify the mood analysis was triggered
        mock_save_mood.assert_called_once()

    def test_empty_content_error(self):
        """Test that sending an empty string returns a 400 Bad Request."""
        response = self.client.post(self.url, {"content": ""}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class NurseLogViewTests(APITestCase):
    def setUp(self):
        # Create users with different roles
        self.student = CustomUser.objects.create_user(
            email="student_nurse@test.com", username="student_nurse", password="pass", role="STUDENT"
        )
        self.nurse = CustomUser.objects.create_user(
            email="nurse@test.com", username="nurse", password="pass", role="NURSE"
        )
        self.counselor = CustomUser.objects.create_user(
            email="counselor@test.com", username="counselor", password="pass", role="COUNSELOR"
        )
        # create_superuser defaults to ADMIN role in your CustomUserManager
        self.admin = CustomUser.objects.create_superuser(
            email="admin@test.com", username="admin", password="pass"
        ) 

        # URL for the specific student's nurse logs (adjust URL pattern if necessary based on your urls.py)
        self.url = f"/api/safety/admin/nurse-logs/{self.student.id}/"

        # Create a dummy log to fetch
        NurseLogEntry.objects.create(
            user=self.student,
            reason="Fever",
            admission_time="09:00 AM",
            observations="Resting in clinic."
        )

    def test_student_forbidden(self):
        """Ensure students cannot access or create nurse logs."""
        self.client.force_authenticate(user=self.student)
        
        # GET request
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # POST request
        response = self.client.post(self.url, {"reason": "Test"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_nurse_can_access_and_create(self):
        """Ensure nurses can fetch and create logs."""
        self.client.force_authenticate(user=self.nurse)
        
        # GET request
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # POST request
        data = {
            "reason": "Headache",
            "timeOfAdmission": "10:30 AM",
            "observations": "Provided medicine."
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(NurseLogEntry.objects.count(), 2)

    def test_counselor_can_access_and_create(self):
        """Ensure counselors can add logs for mental health purposes."""
        self.client.force_authenticate(user=self.counselor)
        
        response = self.client.post(self.url, {
            "reason": "Anxiety attack",
            "timeOfAdmission": "11:00 AM",
            "observations": "Breathing exercises applied."
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_can_access_and_create(self):
        """Ensure admins have full access."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
