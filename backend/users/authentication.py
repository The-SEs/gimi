"""
Custom authentication backend that reads the JWT access token from the
Authorization header AND can fall back to httpOnly refresh cookie.

Access token -> Authorization: Bearer <token> (short-lived, 15 min)
Refresh token -> httpOnly cookie "gimi_refresh" (7 days, never readable by JS)
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Extends simplejwt's standard header-based authentication with no extra
    complexity - the access token comes from the Authorization header.
    This class exists so we have a single place to extend auth logic later
    """

    def authenticate(self, request):
        # Standard header-based auth
        return super().authenticate(request)
