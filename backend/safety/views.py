from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .services import check_journal
from .models import JournalEntry
from .ai_utils import get_llama_response

@api_view(['POST'])
@permission_classes([AllowAny]) # Only for testing
def submit_journal_interceptor(request):
    # Grab text from journal
    student_text = request.data.get('content', '')

    if not student_text:
        return Response({'error': 'Journal cannot be empty'}, status=400)

    print(f"Intercepted new Journal entry: '{student_text}")
    print(f"Sending to server for analysis...")

    # Run interceptor
    is_dangerous, matched_phrase, distance = check_journal(student_text)

    # Routing
    if is_dangerous:
        print(f"RED FLAG CAUGHT! Matched: '{matched_phrase}' (Score: '{distance}')")


        JournalEntry.objects.create(
            content=student_text,
            is_flagged=True
        )
        # TODO: Trigger an email or notification to counselor

        return Response({
            'status': 'high_risk',
            'message': 'We noticed you might be going through a tough time. Would you like to schedule a talk with the school counselor?',
            'debug_match': matched_phrase
        }, status=200)

    else:
        print(f"CLEAR. Closest match was '{matched_phrase}")

        print("Asking llama3.2 for response...")
        ai_reply = get_llama_response(student_text)

        JournalEntry.objects.create(content=student_text, is_flagged=False, ai_chat_response=ai_reply)

        # TODO: Save journal normally to database



        return Response({
            'status': 'success',
            'message': 'Journal entry saved successfully',
            'ai_response': ai_reply
        }, status=201)