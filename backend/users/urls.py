from django.urls import path
from .views import GoogleLogin, RequestResetCodeView, ResetPasswordView, VerifyResetCodeView, UpdateOnboardingStatusView

urlpatterns = [
    path("google/", GoogleLogin.as_view(), name="google_login"),
    path("request-reset/", RequestResetCodeView.as_view(), name="request-reset"),
    path("verify-reset/", VerifyResetCodeView.as_view(), name="verify-reset"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("onboarding-status/", UpdateOnboardingStatusView.as_view(), name="update-onboarding-status"),
]
