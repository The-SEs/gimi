from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Q
from .models import SafetyFlag, EmergencyContact

class AdminSafetyFlagsView(APIView):
    # persmission_classes = [IsAdminUser]

    def get(self, request):
        flags = SafetyFlag.objects.select_related('user').order_by('-timestamp')

        data = []
        for flag in flags:
            data.append({
                "id": flag.id,
                "user_name": flag.user.username,
                "user_email": flag.user.email,
                "flagged_text": flag.flagged_text,
                "matched_phrases": flag.matched_phrases,
                "risk_level": flag.risk_level,
                "timestamp": flag.timestamp
            })

        return Response(data)

class HighRiskStudentsView(APIView):
    # permission_classes = [IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Get users who have at least one 'High' risk level flag (case insensitive)
        users_with_high_risk = SafetyFlag.objects.filter(risk_level__iexact='High')\
            .values('user')\
            .annotate(flag_count=Count('id'))\
            .order_by('-flag_count')

        data = []
        for entry in users_with_high_risk:
            user_id = entry['user']
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                continue

            # Get all 'High' risk flags for this user to aggregate keywords
            user_flags = SafetyFlag.objects.filter(user=user, risk_level__iexact='High').order_by('-timestamp')
            
            all_keywords = []
            flag_history = []
            
            for f in user_flags:
                if f.matched_phrases:
                    all_keywords.extend(f.matched_phrases)
                
                flag_history.append({
                    "id": f"alert-{f.id}",
                    "label": f"Keyword Trigger: {f.flagged_text[:30]}...",
                    "severity": "Critical" if f.risk_level.lower() == 'high' else "Warning",
                    "reportedAt": f.timestamp.strftime("%B %d, %Y")
                })

            # Remove duplicates from keywords
            unique_keywords = list(set([k for k in all_keywords if k]))

            # Fetch actual emergency contacts
            contacts = EmergencyContact.objects.filter(user=user)
            contact_list = []
            for c in contacts:
                contact_list.append({
                    "id": str(c.id),
                    "role": c.role,
                    "name": c.name,
                    "phoneNumber": c.phone_number
                })

            # Student case data
            student_case = {
                "id": str(user.id),
                "name": user.username,
                "email": user.email,
                "age": "20 yrs old",
                "sex": "Not specified",
                "pronouns": "They/Them",
                "studentNumber": user.email,
                "riskLevel": "HIGH",
                "summary": f"Student flagged with {entry['flag_count']} high-risk incidents.",
                "detectedKeywords": unique_keywords if unique_keywords else ["High Risk Content"],
                "alertHistory": flag_history,
                "emergencyContacts": contact_list
            }
            data.append(student_case)

        return Response(data)

class EmergencyContactView(APIView):
    # permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        role = request.data.get("role")
        name = request.data.get("name")
        phone_number = request.data.get("phoneNumber")

        if not all([role, name, phone_number]):
            return Response({"error": "Missing fields"}, status=400)

        contact = EmergencyContact.objects.create(
            user=user,
            role=role,
            name=name,
            phone_number=phone_number
        )

        return Response({
            "id": str(contact.id),
            "role": contact.role,
            "name": contact.name,
            "phoneNumber": contact.phone_number
        }, status=201)

    def patch(self, request, user_id):
        contact_id = request.data.get("id")
        try:
            contact = EmergencyContact.objects.get(id=contact_id, user_id=user_id)
        except EmergencyContact.DoesNotExist:
            return Response({"error": "Contact not found"}, status=404)

        contact.role = request.data.get("role", contact.role)
        contact.name = request.data.get("name", contact.name)
        contact.phone_number = request.data.get("phoneNumber", contact.phone_number)
        contact.save()

        return Response({
            "id": str(contact.id),
            "role": contact.role,
            "name": contact.name,
            "phoneNumber": contact.phone_number
        })

    def delete(self, request, user_id):
        contact_id = request.query_params.get("id")
        try:
            contact = EmergencyContact.objects.get(id=contact_id, user_id=user_id)
            contact.delete()
            return Response(status=204)
        except EmergencyContact.DoesNotExist:
            return Response({"error": "Contact not found"}, status=404)