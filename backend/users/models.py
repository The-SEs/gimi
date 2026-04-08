from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone
from datetime import timedelta
import random


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        if not username:
            raise ValueError("The Username field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", CustomUser.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


# Inherit from AbstractBaseUser and PermissionsMixin instead of AbstractUser
class CustomUser(AbstractBaseUser, PermissionsMixin):  
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        NURSE = "NURSE", "Nurse"
        SECURITY = "SECURITY", "Security"
        COUNSELOR = "COUNSELOR", "Counselor"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    role = models.CharField(
            max_length=20,
            choices=Role.choices,
            default=Role.STUDENT
    )

    # These three fields are required for Django's
    # built-in admin and auth system to function
    is_staff = models.BooleanField(default=False) 
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    # Prompts for username when running createsuperuser
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

class PasswordResetCode(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now=True)

    def generate_code(self):
        self.code = str(random.randint(1000, 9999))
        self.save()
        return self.code

    def is_valid(self):
        return timezone.now() < self.created_at + timedelta(minutes=15)
