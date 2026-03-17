from allauth.account.adapter import DefaultAccountAdapter
from django.forms import ValidationError

# ADAPTER FOR ACCOUNT LOGINS AND SIGN UPS
class CustomAccountAdapter(DefaultAccountAdapter):
    def clean_email(self, email):
        email = super().clean_email(email)
        
        # ENSURE ONLY @iacademy.edu.ph DOMAINS GET ACCEPTED
        # TODO : ENSURE CORRECT REGEX FOR EMAILS
        if not email.endswith('@iacademy.edu.ph'):
            raise ValidationError("Only @iacademy.edu.ph email addresses are allowed to register.")
        
        return email

    def add_message(self, request, level, message_template, message_context=None, extra_tags=''):
        pass
