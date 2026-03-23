from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


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

    def test_list_returns_only_own_journals(self):
        """A user should only see their own journal entries."""
        # Create one entry for the primary user
        self.client.post(self.url, {"content": "My entry."})

        # Switch to other_user and create an entry
        self._authenticate(self.other_user)
        self.client.post(self.url, {"content": "Other user entry."})

        # Switch back and verify only 1 entry is returned
        self._authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_unauthenticated_user_cannot_create_journal(self):
        """Unauthenticated requests must be rejected with 401."""
        self.client.credentials()  # clear token
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
        # Create a journal entry and capture its pk
        response = self.client.post(self.list_url, {"title": "Entry 1", "content": "Hello world."})
        self.entry_id = response.data["id"]
        self.detail_url = f"/api/wellness/journals/{self.entry_id}/"

    def test_retrieve_own_journal_entry(self):
        """A user can fetch one of their own journal entries."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.entry_id)

    def test_update_own_journal_entry(self):
        """A user can update their own journal entry (PUT)."""
        data = {"title": "Updated Title", "content": "Updated content."}
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")

    def test_partial_update_own_journal_entry(self):
        """A user can partially update their own journal entry (PATCH)."""
        response = self.client.patch(self.detail_url, {"title": "Patched Title"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Patched Title")

    def test_delete_own_journal_entry(self):
        """A user can delete their own journal entry."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Confirm it's gone
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_access_other_users_journal_entry(self):
        """A user must not be able to retrieve another user's journal entry."""
        self._authenticate(self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_delete_other_users_journal_entry(self):
        """A user must not be able to delete another user's journal entry."""
        self._authenticate(self.other_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_response_includes_mood_field(self):
        """Journal detail response must include the mood field (null if not yet analyzed)."""
        response = self.client.get(self.detail_url)
        self.assertIn("mood", response.data)


# ---------------------------------------------------------------------------
# Daily Mood (Manual Log) Tests
# ---------------------------------------------------------------------------

class DailyMoodListCreateTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.url = "/api/wellness/daily-moods/"

    def test_create_daily_mood_success(self):
        """An authenticated user can log a mood for today."""
        response = self.client.post(self.url, {"state": "HP"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["state"], "HP")

    def test_create_daily_mood_with_all_valid_states(self):
        """All four mood states should be accepted."""
        valid_states = ["HP", "SD", "AN", "CM"]
        for i, state in enumerate(valid_states):
            # Each test user gets a fresh user so the unique_together constraint doesn't fire
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

    def test_cannot_log_mood_twice_on_same_day(self):
        """The unique_together constraint must prevent duplicate entries per day."""
        self.client.post(self.url, {"state": "HP"})
        response = self.client.post(self.url, {"state": "SD"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_daily_moods_returns_own_entries_only(self):
        """A user should only see their own daily mood entries."""
        self.client.post(self.url, {"state": "CM"})

        # other_user logs their own mood
        self._authenticate(self.other_user)
        self.client.post(self.url, {"state": "AN"})

        # Back to primary user — should see only 1 record
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
