from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    provider = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "is_staff",
            "date_joined",
            "provider",
            "avatar",
        ]
        read_only_fields = fields

    def get_provider(self, obj) -> str:
        if hasattr(obj, "socialaccount_set"):
            if obj.socialaccount_set.filter(provider="google").exists():
                return "google"
        return "email"

    def get_avatar(self, obj) -> str | None:
        if hasattr(obj, "socialaccount_set"):
            social = obj.socialaccount_set.filter(provider="google").first()
            if social and social.extra_data:
                return social.extra_data.get("picture")
        return None
