from django.urls import path
from . import views

urlpatterns = [
    path("admin/flags/", views.AdminSafetyFlagsView.as_view(), name="admin-safety-flags"),
    path("admin/high-risk/", views.HighRiskStudentsView.as_view(), name="admin-high-risk"),
    path("admin/emergency-contacts/<int:user_id>/", views.EmergencyContactView.as_view(), name="admin-emergency-contacts"),
]
