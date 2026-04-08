from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.register_url = "/api/auth/registration/"
        self.login_url    = "/api/auth/login/"
        self.user_url     = "/api/auth/user/"

        self.valid_username = "student123"
        self.valid_email    = "student@iacademy.edu.ph"
        self.invalid_email  = "hacker@gmail.com"
        self.password       = "SuperSecret123!"

    # ── registration ─────────────────────────────────────────────────────────

    def test_registration_success_with_valid_domain(self):
        """An @iacademy.edu.ph email can register and receives JWTs."""
        data = {
            "username":  self.valid_username,
            "email":     self.valid_email,
            "password1": self.password,
            "password2": self.password,
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.valid_email).exists())
        user = User.objects.get(email=self.valid_email)
        self.assertEqual(user.username, self.valid_username)
        self.assertIn("access", response.data)

    def test_registration_fail_with_invalid_domain(self):
        """Custom adapter blocks non-iACADEMY emails with 400."""
        data = {
            "username":  "hacker123",
            "email":     self.invalid_email,
            "password1": self.password,
            "password2": self.password,
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email=self.invalid_email).exists())
        self.assertIn("email", response.data)

    # ── login ─────────────────────────────────────────────────────────────────

    def test_login_success(self):
        """An existing user can log in and retrieve access + refresh tokens."""
        User.objects.create_user(
            username=self.valid_username,
            email=self.valid_email,
            password=self.password,
        )
        response = self.client.post(
            self.login_url, {"email": self.valid_email, "password": self.password}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    # ── protected endpoint ────────────────────────────────────────────────────

    def test_access_protected_user_details_with_valid_token(self):
        """A valid JWT grants access to the /user/ endpoint."""
        User.objects.create_user(
            username=self.valid_username,
            email=self.valid_email,
            password=self.password,
        )
        login = self.client.post(
            self.login_url, {"email": self.valid_email, "password": self.password}
        )
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + login.data["access"])

        response = self.client.get(self.user_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"],    self.valid_email)
        self.assertEqual(response.data["username"], self.valid_username)

    def test_access_protected_user_details_without_token(self):
        """Missing token must be rejected with 401."""
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
