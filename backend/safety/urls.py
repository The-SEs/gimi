from django.urls import path
from . import views

urlpatterns = [
    path("admin/flags/", views.AdminSafetyFlagsView.as_view(), name="admin-safety-flags"),
    path("admin/high-risk/", views.HighRiskStudentsView.as_view(), name="admin-high-risk"),
    path("admin/emergency-contacts/<int:user_id>/", views.EmergencyContactView.as_view(), name="admin-emergency-contacts"),
    path("admin/medical-info/<int:user_id>/", views.StudentMedicalInfoView.as_view(), name="admin-medical-info"),
    path("admin/conditions/<int:user_id>/", views.ActiveConditionView.as_view(), name="admin-conditions"),
    path("admin/medications/<int:user_id>/", views.MedicationRecordView.as_view(), name="admin-medications"),
    path("admin/hospitalization/<int:user_id>/", views.HospitalizationHistoryView.as_view(), name="admin-hospitalization"),
    path("admin/nurse-logs/<int:user_id>/", views.NurseLogView.as_view(), name="admin-nurse-logs"),
    path('admin/flags/student/<int:user_id>/', views.StudentSafetySummaryView.as_view(), name='student-safety-summary'),
]
