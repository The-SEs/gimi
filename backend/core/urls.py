from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/users/", include("users.urls")),
    path("api/wellness/", include("wellness.urls")),
    path("api/consultations/", include("consultations.urls")),
    path("api/safety/", include("safety.urls")),
]
