from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone


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

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


# Inherit from AbstractBaseUser and PermissionsMixin instead of AbstractUser
class CustomUser(AbstractBaseUser, PermissionsMixin):  # type: ignore
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    # These three fields are required for Django's
    # built-in admin and auth system to function
    is_staff = models.BooleanField(default=False)  # type: ignore
    is_active = models.BooleanField(default=True)  # type: ignore
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    # Prompts for username when running createsuperuser
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):  # type: ignore
        return self.email
