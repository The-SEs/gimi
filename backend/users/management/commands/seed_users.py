from django.core.management.base import BaseCommand
from users.models import CustomUser

class Command(BaseCommand):
    help = 'Seeds the database with test users for each role (Admin, Student, Nurse, Counselor, Security)'

    def handle(self, *args, **kwargs):
        default_password = "testpassword123"

        test_users = [
            {
                "email": "admin_test@iacademy.edu.ph",
                "username": "admin_test",
                "role": "ADMIN",
                "is_superuser": True,
                "is_staff": True
            },
            {
                "email": "student_test@iacademy.edu.ph",
                "username": "student_test",
                "role": "STUDENT",
                "is_superuser": False,
                "is_staff": False
            },
            {
                "email": "nurse_test@iacademy.edu.ph",
                "username": "nurse_test",
                "role": "NURSE",
                "is_superuser": False,
                "is_staff": True
            },
            {
                "email": "counselor_test@iacademy.edu.ph",
                "username": "counselor_test",
                "role": "COUNSELOR",
                "is_superuser": False,
                "is_staff": True
            },
            {
                "email": "security_test@iacademy.edu.ph",
                "username": "security_test",
                "role": "SECURITY",
                "is_superuser": False,
                "is_staff": True
            }
        ]

        self.stdout.write("Seeding test users...")

        for user_data in test_users:
            email = user_data["email"]
            username = user_data["username"]
            role = user_data["role"]
            is_superuser = user_data["is_superuser"]
            is_staff = user_data["is_staff"]

            # Check if user already exists to prevent duplicate errors
            if CustomUser.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f"⚠️ User already exists: {email} ({role})"))
                continue

            try:
                if is_superuser:
                    # Use create_superuser for the admin
                    user = CustomUser.objects.create_superuser(
                        email=email,
                        username=username,
                        password=default_password,
                        role=role
                    )
                else:
                    # Use create_user for everyone else
                    user = CustomUser.objects.create_user(
                        email=email,
                        username=username,
                        password=default_password,
                        role=role,
                        is_staff=is_staff
                    )
                
                self.stdout.write(self.style.SUCCESS(f"✅ Created {role} account: {email}"))
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Failed to create {role}: {e}"))

        self.stdout.write(self.style.SUCCESS("\n🎉 User seeding complete!"))
        self.stdout.write(self.style.SUCCESS(f"All test accounts use the password: {default_password}"))
