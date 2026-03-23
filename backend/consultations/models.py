from django.db import models
from django.conf import settings

# Create your models here.


class Consultation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PE", "Pending"
        SCHEDULED = "SC", "Scheduled"
        COMPLETED = "CO", "Completed"
        CANCELLED = "CA", "Cancelled"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="consultations"
    )
    requested_date = models.DateTimeField()
    reason = models.TextField(help_text="Reason for the consultation")
    status = models.CharField(
        max_length=2, choices=Status.choices, default=Status.PENDING
    )

    def __str__(self):
        return f"Consultation for {self.student.email} on {self.requested_data.data()}"
