from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from unittest.mock import patch

User = get_user_model()

MOCK_SAFETY_SAFE = (False, None, 1.0)
MOCK_SAFETY_DANGEROUS = (True, "hurt myself", 0.1)
MOCK_AI_REPLY = "That sounds like a meaningful experience."
MOCK_MOOD_RESULT = (
    {"mood_label": "happy", "confidence": 0.9, "summary": "You seem happy."},
    {}
)


class BaseTestCase(APITestCase):
    """Shared setup for all journal and mood tests."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="student123",
            email="student@iacademy.edu.ph",
            password="SuperSecret123!",
        )
        self.other_user = User.objects.create_user(
            username="other456",
            email="other@iacademy.edu.ph",
            password="SuperSecret123!",
        )
        self._authenticate(self.user)

    def _authenticate(self, user):
        """Helper: log in and attach the Bearer token to the test client."""
        response = self.client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "SuperSecret123!"},
        )
        token = response.data.get("access")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)


# ---------------------------------------------------------------------------
# Journal Entry Tests
# ---------------------------------------------------------------------------

class JournalListCreateTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.url = "/api/wellness/journals/"
        self._start_mocks(safety=MOCK_SAFETY_SAFE)

    def _start_mocks(self, safety=MOCK_SAFETY_SAFE):
        """Start patches for external calls. Call again to swap safety behavior."""
        for attr in ("mock_safety", "mock_llama", "mock_mood"):
            mock = getattr(self, attr, None)
            if mock:
                mock.stop()

        patcher_safety = patch("wellness.views.check_journal", return_value=safety)
        patcher_llama = patch("wellness.views.get_llama_response", return_value=MOCK_AI_REPLY)
        patcher_mood = patch("wellness.views.analyze_mood", return_value=MOCK_MOOD_RESULT)

        self.mock_safety = patcher_safety.start()
        self.mock_llama = patcher_llama.start()
        self.mock_mood = patcher_mood.start()

        self.addCleanup(patcher_safety.stop)
        self.addCleanup(patcher_llama.stop)
        self.addCleanup(patcher_mood.stop)

    # --- create ---

    def test_create_journal_entry_success(self):
        """An authenticated user can create a journal entry."""
        data = {"title": "My First Entry", "content": "Today was a good day."}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "My First Entry")
        self.assertEqual(response.data["content"], "Today was a good day.")

    def test_create_journal_entry_without_title(self):
        """Title is optional (blank=True); entry should still be created."""
        data = {"content": "No title today."}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "")

    def test_create_journal_entry_missing_content_fails(self):
        """Content is required; omitting it should return 400."""
        data = {"title": "No Content"}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("content", response.data)

    def test_create_journal_returns_status_and_ai_response(self):
        """Response body must include status, message, and ai_response for safe entries."""
        response = self.client.post(self.url, {"content": "Had a great day."})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("ai_response", response.data)
        self.assertEqual(response.data["ai_response"], MOCK_AI_REPLY)

    def test_create_flagged_journal_returns_high_risk_status(self):
        """A dangerous entry must be flagged and return high_risk status."""
        self._start_mocks(safety=MOCK_SAFETY_DANGEROUS)
        response = self.client.post(self.url, {"content": "I want to hurt myself."})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "high_risk")
        self.assertIn("message", response.data)
        self.assertTrue(response.data["is_flagged"])

    # --- list ---

    def test_list_returns_only_own_journals(self):
        """A user should only see their own journal entries."""
        self.client.post(self.url, {"content": "My entry."})

        self._authenticate(self.other_user)
        self.client.post(self.url, {"content": "Other user entry."})

        self._authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    # --- auth ---

    def test_unauthenticated_user_cannot_create_journal(self):
        """Unauthenticated requests must be rejected with 401."""
        self.client.credentials()
        response = self.client.post(self.url, {"content": "Should fail."})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_list_journals(self):
        """Unauthenticated requests must be rejected with 401."""
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class JournalDetailTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.list_url = "/api/wellness/journals/"

        patcher_safety = patch("wellness.views.check_journal", return_value=MOCK_SAFETY_SAFE)
        patcher_llama = patch("wellness.views.get_llama_response", return_value=MOCK_AI_REPLY)
        patcher_mood = patch("wellness.views.analyze_mood", return_value=MOCK_MOOD_RESULT)

        self.mock_safety = patcher_safety.start()
        self.mock_llama = patcher_llama.start()
        self.mock_mood = patcher_mood.start()

        self.addCleanup(patcher_safety.stop)
        self.addCleanup(patcher_llama.stop)
        self.addCleanup(patcher_mood.stop)

        response = self.client.post(self.list_url, {"title": "Entry 1", "content": "Hello world."})
        self.entry_id = response.data["id"]
        self.detail_url = f"/api/wellness/journals/{self.entry_id}/"

    # --- retrieve ---

    def test_retrieve_own_journal_entry(self):
        """A user can fetch one of their own journal entries."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.entry_id)

    def test_response_includes_mood_field(self):
        """Journal detail response must include the mood field."""
        response = self.client.get(self.detail_url)
        self.assertIn("mood", response.data)

    def test_mood_field_is_populated_after_create(self):
        """After creation, the mood field must be non-null with a valid mood_label."""
        response = self.client.get(self.detail_url)
        self.assertIsNotNone(response.data["mood"])
        self.assertIn(response.data["mood"]["mood_label"], [
            "happy", "sad", "anxious", "calm",
            "angry", "neutral", "excited", "stressed",
        ])

    # --- update ---

    def test_update_own_journal_entry(self):
        """A user can update their own journal entry (PUT)."""
        data = {"title": "Updated Title", "content": "Updated content."}
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")

    def test_put_requires_content(self):
        """PUT without content must return 400."""
        response = self.client.put(self.detail_url, {"title": "No content here"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("content", response.data)

    def test_partial_update_own_journal_entry(self):
        """A user can partially update their own journal entry (PATCH)."""
        response = self.client.patch(self.detail_url, {"title": "Patched Title"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Patched Title")

    def test_update_returns_status_and_ai_response(self):
        """Update response body must include status and ai_response for safe entries."""
        response = self.client.put(
            self.detail_url,
            {"title": "Updated", "content": "Updated content."}
        )
        self.assertEqual(response.data["status"], "success")
        self.assertIn("ai_response", response.data)

    def test_update_flagged_entry_returns_high_risk(self):
        """Updating with dangerous content must return high_risk status."""
        with patch("wellness.views.check_journal", return_value=MOCK_SAFETY_DANGEROUS):
            response = self.client.put(
                self.detail_url,
                {"title": "Dark", "content": "I want to hurt myself."}
            )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "high_risk")
        self.assertTrue(response.data["is_flagged"])

    # --- delete ---

    def test_delete_own_journal_entry(self):
        """A user can delete their own journal entry."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- ownership ---

    def test_cannot_access_other_users_journal_entry(self):
        """A user must not be able to retrieve another user's journal entry."""
        self._authenticate(self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_other_users_journal_entry(self):
        """A user must not be able to update another user's journal entry."""
        self._authenticate(self.other_user)
        response = self.client.put(self.detail_url, {"title": "X", "content": "X"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_delete_other_users_journal_entry(self):
        """A user must not be able to delete another user's journal entry."""
        self._authenticate(self.other_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# Daily Mood (Manual Log) Tests
# ---------------------------------------------------------------------------

class DailyMoodListCreateTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.url = "/api/wellness/daily-moods/"

    # --- create ---

    def test_create_daily_mood_success(self):
        """First mood log of the day returns 201."""
        response = self.client.post(self.url, {"state": "HP"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["state"], "HP")

    def test_create_daily_mood_with_all_valid_states(self):
        """All four mood states should be accepted."""
        valid_states = ["HP", "SD", "AN", "CM"]
        for i, state in enumerate(valid_states):
            user = User.objects.create_user(
                username=f"user_{i}",
                email=f"user{i}@iacademy.edu.ph",
                password="SuperSecret123!",
            )
            self._authenticate(user)
            response = self.client.post(self.url, {"state": state})
            self.assertEqual(
                response.status_code,
                status.HTTP_201_CREATED,
                msg=f"State '{state}' should be valid but got {response.status_code}",
            )

    def test_create_daily_mood_invalid_state_fails(self):
        """An unrecognized mood state should return 400."""
        response = self.client.post(self.url, {"state": "UNKNOWN"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("state", response.data)

    def test_create_daily_mood_missing_state_fails(self):
        """Missing state field should return 400."""
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("state", response.data)

    # --- same-day update behavior ---

    def test_first_mood_of_day_returns_201(self):
        """First POST of the day must return 201."""
        response = self.client.post(self.url, {"state": "CM"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_mood_same_day_returns_200(self):
        """Second POST on the same day must update the record and return 200."""
        self.client.post(self.url, {"state": "HP"})
        response = self.client.post(self.url, {"state": "SD"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["state"], "SD")

    def test_update_mood_same_day_only_one_record_exists(self):
        """After multiple same-day POSTs, only one record should exist for that user."""
        self.client.post(self.url, {"state": "HP"})
        self.client.post(self.url, {"state": "SD"})
        self.client.post(self.url, {"state": "CM"})
        response = self.client.get(self.url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["state"], "CM")

    # --- list ---

    def test_list_daily_moods_returns_own_entries_only(self):
        """A user should only see their own daily mood entries."""
        self.client.post(self.url, {"state": "CM"})

        self._authenticate(self.other_user)
        self.client.post(self.url, {"state": "AN"})

        self._authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["state"], "CM")

    def test_date_field_is_auto_set_and_read_only(self):
        """The date field must be set automatically and not overridable by the client."""
        response = self.client.post(self.url, {"state": "HP", "date": "2000-01-01"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        today = timezone.now().date().isoformat()
        self.assertEqual(response.data["date"], today)

    # --- auth ---

    def test_unauthenticated_user_cannot_log_mood(self):
        """Unauthenticated requests must be rejected with 401."""
        self.client.credentials()
        response = self.client.post(self.url, {"state": "HP"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_list_moods(self):
        """Unauthenticated requests must be rejected with 401."""
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
