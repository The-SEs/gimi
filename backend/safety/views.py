from rest_framework.views import APIView
from rest_framework.response import Response
from wellness.views import get_smart_snippet
from users.permissions import IsAdminRole, IsCounselor, IsNurse
from .models import SafetyFlag
from django.db.models import Count, Q
from .models import (
    SafetyFlag, EmergencyContact, StudentMedicalInfo,
    ActiveCondition, MedicationRecord, HospitalizationHistory, NurseLogEntry
)

class AdminSafetyFlagsView(APIView):
    def get(self, request):
        flags = SafetyFlag.objects.select_related('user').order_by('-timestamp')
        data = []
        for flag in flags:
            # Generate snippet on the fly for the dashboard
            matched = flag.matched_phrases[0] if flag.matched_phrases else ""
            snippet = get_smart_snippet(flag.flagged_text, matched)

            data.append({
                "id": flag.id,
                "user_id": flag.user.id,
                "user_name": flag.user.username,
                "user_email": flag.user.email,
                "flagged_text": snippet, # <--- The dashboard stays SNIPPED
                "risk_level": flag.risk_level,
                "timestamp": flag.timestamp.isoformat() # <--- FIXED DATE
            })
        return Response(data)
class StudentMedicalInfoView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

    def get(self, request, user_id):
        info, _ = StudentMedicalInfo.objects.get_or_create(user_id=user_id)
        return Response({
            "allergies": info.allergies,
            "primary_physician": info.primary_physician
        })

    def patch(self, request, user_id):
        info, _ = StudentMedicalInfo.objects.get_or_create(user_id=user_id)
        info.allergies = request.data.get("allergies", info.allergies)
        info.primary_physician = request.data.get("primary_physician", info.primary_physician)
        info.save()
        return Response({
            "allergies": info.allergies,
            "primary_physician": info.primary_physician
        })

class ActiveConditionView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

    def get(self, request, user_id):
        conditions = ActiveCondition.objects.filter(user_id=user_id)
        return Response([{
            "id": c.id,
            "category": c.category,
            "name": c.name,
            "description": c.description,
            "severity": c.severity
        } for c in conditions])

    def post(self, request, user_id):
        condition = ActiveCondition.objects.create(
            user_id=user_id,
            category=request.data.get("category"),
            name=request.data.get("name"),
            description=request.data.get("description"),
            severity=request.data.get("severity", "normal")
        )
        return Response({"id": condition.id}, status=201)

    def patch(self, request, user_id):
        condition_id = request.data.get("id")
        condition = ActiveCondition.objects.get(id=condition_id, user_id=user_id)
        condition.category = request.data.get("category", condition.category)
        condition.name = request.data.get("name", condition.name)
        condition.description = request.data.get("description", condition.description)
        condition.severity = request.data.get("severity", condition.severity)
        condition.save()
        return Response({"status": "updated"})

    def delete(self, request, user_id):
        condition_id = request.query_params.get("id")
        ActiveCondition.objects.filter(id=condition_id, user_id=user_id).delete()
        return Response(status=204)

class MedicationRecordView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

    def get(self, request, user_id):
        meds = MedicationRecord.objects.filter(user_id=user_id)
        return Response([{
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "isActive": m.is_active
        } for m in meds])

    def post(self, request, user_id):
        med = MedicationRecord.objects.create(
            user_id=user_id,
            name=request.data.get("name"),
            dosage=request.data.get("dosage"),
            frequency=request.data.get("frequency"),
            is_active=request.data.get("isActive", True)
        )
        return Response({"id": med.id}, status=201)

    def patch(self, request, user_id):
        med_id = request.data.get("id")
        med = MedicationRecord.objects.get(id=med_id, user_id=user_id)
        med.name = request.data.get("name", med.name)
        med.dosage = request.data.get("dosage", med.dosage)
        med.frequency = request.data.get("frequency", med.frequency)
        med.is_active = request.data.get("isActive", med.is_active)
        med.save()
        return Response({"status": "updated"})

    def delete(self, request, user_id):
        med_id = request.query_params.get("id")
        MedicationRecord.objects.filter(id=med_id, user_id=user_id).delete()
        return Response(status=204)

class HospitalizationHistoryView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

    def get(self, request, user_id):
        history = HospitalizationHistory.objects.filter(user_id=user_id)
        return Response([{
            "id": h.id,
            "date": h.date_range,
            "careType": h.care_type,
            "title": h.title,
            "description": h.description,
            "level": h.level
        } for h in history])

    def post(self, request, user_id):
        entry = HospitalizationHistory.objects.create(
            user_id=user_id,
            date_range=request.data.get("date"),
            care_type=request.data.get("careType"),
            title=request.data.get("title"),
            description=request.data.get("description"),
            level=request.data.get("level", 1)
        )
        return Response({"id": entry.id}, status=201)

    def patch(self, request, user_id):
        entry_id = request.data.get("id")
        entry = HospitalizationHistory.objects.get(id=entry_id, user_id=user_id)
        entry.date_range = request.data.get("date", entry.date_range)
        entry.care_type = request.data.get("careType", entry.care_type)
        entry.title = request.data.get("title", entry.title)
        entry.description = request.data.get("description", entry.description)
        entry.level = request.data.get("level", entry.level)
        entry.save()
        return Response({"status": "updated"})

    def delete(self, request, user_id):
        entry_id = request.query_params.get("id")
        HospitalizationHistory.objects.filter(id=entry_id, user_id=user_id).delete()
        return Response(status=204)

class NurseLogView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

    def get(self, request, user_id):
        logs = NurseLogEntry.objects.filter(user_id=user_id).order_by('-created_at')
        return Response([{
            "date": l.created_at.strftime("%b %d • %I:%M %p").upper(),
            "title": l.reason,
            "description": l.observations
        } for l in logs])

    def post(self, request, user_id):
        log = NurseLogEntry.objects.create(
            user_id=user_id,
            reason=request.data.get("reason"),
            admission_time=request.data.get("timeOfAdmission"),
            observations=request.data.get("observations")
        )
        return Response({"status": "saved"}, status=201)

class HighRiskStudentsView(APIView):
    permission_classes = [IsNurse | IsCounselor | IsAdminRole]

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

            # Medical data
            med_info, _ = StudentMedicalInfo.objects.get_or_create(user=user)
            conditions = [{
                "id": c.id,
                "category": c.category,
                "name": c.name,
                "description": c.description,
                "severity": c.severity
            } for c in ActiveCondition.objects.filter(user=user)]

            medications = [{
                "id": m.id,
                "name": m.name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "isActive": m.is_active
            } for m in MedicationRecord.objects.filter(user=user)]

            h_history = [{
                "id": h.id,
                "date": h.date_range,
                "careType": h.care_type,
                "title": h.title,
                "description": h.description,
                "level": h.level
            } for h in HospitalizationHistory.objects.filter(user=user)]

            nurse_logs = [{
                "date": l.created_at.strftime("%b %d • %I:%M %p").upper(),
                "title": l.reason,
                "description": l.observations
            } for l in NurseLogEntry.objects.filter(user=user).order_by('-created_at')]

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
                "emergencyContacts": contact_list,
                "allergies": med_info.allergies.split(",") if med_info.allergies else [],
                "primaryPhysician": med_info.primary_physician,
                "conditions": conditions,
                "medications": medications,
                "hospitalizationHistory": h_history,
                "nurseHistory": nurse_logs
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

# safety/views.py

class StudentSafetySummaryView(APIView):
    def get(self, request, user_id):
        flag = SafetyFlag.objects.filter(user_id=user_id).order_by('-timestamp').first()
        if not flag:
            return Response({"detail": "Not found"}, status=404)

        matched = flag.matched_phrases[0] if flag.matched_phrases else ""

        return Response({
            "id": flag.id,
            "user_name": flag.user.username,
            "risk_level": flag.risk_level,
            "ai_summary": flag.ai_summary,
            "matched_phrases": flag.matched_phrases,

            # SEND BOTH SO REACT CAN CHOOSE
            "full_text": flag.flagged_text,  # <--- FULL CONTENT for Modal
            "snippet": get_smart_snippet(flag.flagged_text, matched), # <--- SNIPPET for Sidebar

            "timestamp": flag.timestamp.isoformat() # <--- FIXED DATE
        })