from django.db import models
from pgvector.django import VectorField
from django.conf import settings

# Create your models here.
class HighRiskPhrase(models.Model):
    # The text
    text = models.CharField(max_length=500, unique=True)

    # embedded text dimension
    embedding = VectorField(dimensions=768)

    def __str__(self):
        return self.text

class SafetyFlag(models.Model):
    # Links to consumer model automatically
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='safety_flags')

    flagged_text = models.TextField()

    matched_phrases = models.JSONField(default=list)

    risk_level = models.CharField(max_length=20, default='High')

    timestamp = models.DateTimeField(auto_now_add=True)

    ai_summary = models.TextField(blank=True, null=True)

    SOURCE_CHOICES = [
        ('CHAT', 'Chat Message'),
        ('JOURNAL', 'Journal Entry'),
    ]

    source = models.CharField(
        max_length=10,
        choices=SOURCE_CHOICES,
        default='CHAT'
    )

    def __str__(self):
        return f"Flag for {self.user.username} at {self.timestamp}"

class EmergencyContact(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emergency_contacts')
    role = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role}: {self.name} for {self.user.username}"

class StudentMedicalInfo(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medical_info')
    allergies = models.TextField(blank=True)
    primary_physician = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Medical Info for {self.user.username}"

class ActiveCondition(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='active_conditions')
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=[('critical', 'Critical'), ('normal', 'Normal')], default='normal')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

class MedicationRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} for {self.user.username}"

class HospitalizationHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hospitalization_history')
    date_range = models.CharField(max_length=100)
    care_type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    level = models.IntegerField(choices=[(1, 1), (2, 2), (3, 3)], default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class NurseLogEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nurse_logs')
    reason = models.CharField(max_length=255)
    admission_time = models.CharField(max_length=20)
    observations = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log for {self.user.username} at {self.created_at}"