from pgvector.django import CosineDistance
from safety.models import HighRiskPhrase
from safety.ai_utils import get_embedding

def check_journal(student_text):
    # Ask server to turn the new text into math
    try:
        student_vector = get_embedding(student_text)
    except Exception as e:
        print(f"Failed to connect to AI server: {e}")
        return False, None

    # Ask postgres to find the closest phrase mathematically
    closest_match = HighRiskPhrase.objects.annotate(
        distance=CosineDistance('embedding', student_vector)
    ).order_by('distance').first()

    # Threshold (Lower distance = more similar)
    THRESHOLD = 0.30



    from pgvector.django import CosineDistance
from safety.models import HighRiskPhrase
from safety.ai_utils import get_embedding

def check_journal(student_text):
    # Ask server to turn the new text into math
    try:
        student_vector = get_embedding(student_text)
    except Exception as e:
        print(f"Failed to connect to AI server: {e}")
        return False, None

    # Ask postgres to find the closest phrase mathematically
    closest_match = HighRiskPhrase.objects.annotate(
        distance=CosineDistance('embedding', student_vector)
    ).order_by('distance').first()

    # Threshold (Lower distance = more similar)
    THRESHOLD = 0.30



    is_dangerous = closest_match and closest_match.distance < THRESHOLD

    if is_dangerous:
        # If the text is very short (e.g., < 4 words), require a much stricter threshold.
        # This prevents safe short phrases like "I am tired" (which point in the same
        # direction as "tired of living") from being flagged falsely.
        if len(student_text.split()) < 4 and closest_match.distance > 0.20:
            return False, closest_match.text, closest_match.distance

        return True, closest_match.text, closest_match.distance
    else:
        # Return False if no match was found or if it was above the 0.35 threshold
        return (
            False,
            closest_match.text if closest_match else None,
            closest_match.distance if closest_match else None
        )