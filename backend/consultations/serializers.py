from rest_framework import serializers
from django.utils import timezone
from datetime import time
from .models import Consultation

ALLOWED_TIMES = [
    time(8, 30),
    time(9, 0),
    time(10, 0),
    time(11, 0),
    time(12, 0),
    time(13, 0),
    time(14, 0),
    time(15, 0),
    time(16, 30),
]


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = [
            "id",
            "student",
            "requested_date",
            "reason",
            "status",
            "mode_of_consultation",
        ]

        read_only_fields = ["id", "student"]

    def validate_requested_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError(
                "Appointments cannot be scheduled in the past."
            )

        local_time = timezone.localtime(value).time()
        if local_time not in ALLOWED_TIMES:
            raise serializers.ValidationError(
                "Invalid time slot. Allowed times are 8:30 AM, 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM, 2:00 PM, 3:00 PM, and 4:30 PM."
            )

        queryset = Consultation.objects.filter(requested_date=value)
        if self.instance:
            queryset = queryset.exlude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This time slot is already booked. Please choose another time."
            )

        return value
