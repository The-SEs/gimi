from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # 1. The columns displayed on the list view
    list_display = ["email", "username", "is_staff", "is_active"]

    # 2. The fields you can search by
    search_fields = ["email", "username"]

    # 3. The layout when editing an existing user
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # 4. The layout when creating a brand new user from the admin panel
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password"),
            },
        ),
    )

    # Optional: order by email instead of username
    ordering = ["email"]


admin.site.register(CustomUser, CustomUserAdmin)
