from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.forms import ValidationError


class CustomAccountAdapter(DefaultAccountAdapter):
    def clean_email(self, email):
        email = super().clean_email(email)
        email = email.lower().strip()

        allowed_domains = ["@iacademy.edu.ph", "@iacademy.ph"]
        if not any(email.endswith(domain) for domain in allowed_domains):
            raise ValidationError(
                "Registration is restricted to valid iACADEMY institutional emails."
            )
        return email

    def populate_username(self, request, user):
        """
        Overrides the default username population to use the email prefix
        and ensure uniqueness
        """
        from django.contrib.auth import get_user_model

        User = get_user_model()

        email = user.email
        base_username = email.split("@")[0]
        username = base_username

        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user.username = username
        return user

    def add_message(
        self, request, level, message_template, message_context=None, extra_tags=""
    ):
        # Suppress allauth's built-in messages since this is a headless API
        pass


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request, sociallogin):
        """
        Ensures that even if they use Google, they MUST use an iACADEMY email.
        """
        email = sociallogin.user.email.lower().strip()
        allowed_domains = ["@iacademy.edu.ph", "@iacademy.ph"]

        if not any(email.endswith(domain) for domain in allowed_domains):
            # This stops the Google signup process immediately
            raise ValidationError(
                "You must use your iACADEMY Google account to sign in."
            )
        return True
