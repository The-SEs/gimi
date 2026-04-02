from django.urls import path
from . import views

urlpatterns = [
    path("admin/flags/", views.AdminSafetyFlagsView.as_view(), name="admin-safety-flags")
]
