from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/registration/"
        self.login_url = "/api/auth/login/"
        self.user_url = "/api/auth/user/"

        self.valid_username = "student123"
        self.valid_email = "student@iacademy.edu.ph"
        self.invalid_email = "hacker@gmail.com"
        self.password = "SuperSecret123!"

    def test_registration_success_with_valid_domain(self):
        """Test that an @iacademy.edu.ph email can successfully register and receive JWTs."""
        data = {
            "username": self.valid_username,
            "email": self.valid_email,
            "password1": self.password,
            "password2": self.password,
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.valid_email).exists())

        # Verify the username was saved correctly
        user = User.objects.get(email=self.valid_email)
        self.assertEqual(user.username, self.valid_username)

        self.assertIn("access", response.data)

    def test_registration_fail_with_invalid_domain(self):
        """Test that the custom adapter blocks non-iACADEMY emails."""
        data = {
            "username": "hacker123",
            "email": self.invalid_email,
            "password1": self.password,
            "password2": self.password,
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email=self.invalid_email).exists())
        self.assertIn("email", response.data)

        # Note: Ensure this string exactly matches the ValidationError raised in your CustomAccountAdapter
        self.assertEqual(
            response.data["email"][0],
            "Only @iacademy.edu.ph email addresses are allowed to register.",
        )

    def test_login_success(self):
        """Test that an existing user can log in and retrieve tokens."""
        # Create user with the username included
        User.objects.create_user(
            username=self.valid_username, email=self.valid_email, password=self.password
        )

        data = {"email": self.valid_email, "password": self.password}
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_access_protected_user_details(self):
        """Test that a valid JWT grants access to the protected /user/ endpoint."""
        # Create user with the username included
        User.objects.create_user(
            username=self.valid_username, email=self.valid_email, password=self.password
        )

        login_response = self.client.post(
            self.login_url, {"email": self.valid_email, "password": self.password}
        )
        access_token = login_response.data.get("access")

        # Add the Bearer token to the authorization header
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + access_token)

        response = self.client.get(self.user_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.valid_email)

        # Optional: Verify the endpoint returns the correct username
        self.assertEqual(response.data["username"], self.valid_username)
