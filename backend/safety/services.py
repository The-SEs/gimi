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
    THRESHOLD = 0.35

    if closest_match and closest_match.distance < THRESHOLD:
        return True, closest_match.text, closest_match.distance
    else:
        return False, closest_match.text if closest_match else None, closest_match.distance if closest_match else None