from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, PasswordResetCode
from .permissions import IsStudent, IsNurse, IsSecurity, IsCounselor, IsAdminRole
import os

# Create your views here.

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

class RequestResetCodeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
            reset_obj, _ = PasswordResetCode.objects.get_or_create(user=user)
            code = reset_obj.generate_code()

            send_mail(
                'Your Gimi Password Reset Code',
                f'Your 4-digit reset code is: {code}. It expires in 15 minutes.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except CustomUser.DoesNotExist:
            pass

        return Response({"detail": "If the email exists, a code was sent."}, status=status.HTTP_200_OK)

class VerifyResetCodeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        try:
            user = CustomUser.objects.get(email=email)
            reset_obj = PasswordResetCode.objects.get(user=user, code=code)

            if reset_obj.is_valid():
                return Response({"detail": "Code is valid."}, status=status.HTTP_200_OK)
            return Response({"error": "Code has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (CustomUser.DoesNotExist, PasswordResetCode.DoesNotExist):
            return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        try:
            user = CustomUser.objects.get(email=email)
            reset_obj = PasswordResetCode.objects.get(user=user, code=code)

            if reset_obj.is_valid():
                user.set_password(new_password)
                user.save()
                reset_obj.delete() # Clean up the code
                return Response({"detail": "Password successfully reset."}, status=status.HTTP_200_OK)
            return Response({"error": "Code has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (CustomUser.DoesNotExist, PasswordResetCode.DoesNotExist):
            return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

class NurseDashboardDataView(APIView):
    permission_classes = [IsAuthenticated, IsNurse]

    def get(self, request):
        return Response({"detail": "Secure nurse data accessed."}, status=status.HTTP_200_OK)


class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        return Response({"detail": "Student profile data."}, status=status.HTTP_200_OK)

class UpdateOnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def patch(self, request):
        user = request.user
        
        if 'has_accepted_disclaimers' in request.data:
            user.has_accepted_disclaimers = request.data['has_accepted_disclaimers']
            
        if 'has_completed_onboarding' in request.data:
            user.has_completed_onboarding = request.data['has_completed_onboarding']
            
        user.save()
        return Response({"detail": "Status updated successfully."}, status=status.HTTP_200_OK)
