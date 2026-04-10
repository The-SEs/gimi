import re
from pgvector.django import CosineDistance
from safety.models import HighRiskPhrase
from safety.ai_utils import get_embedding

def check_journal(student_text):
    # 1. SPLIT THE LONG TEXT INTO SENTENCES / CHUNKS
    # This splits by periods, exclamation marks, question marks, and newlines
    raw_sentences = re.split(r'(?<=[.!?])\s+|\n+', student_text.strip())

    # Clean up empty strings
    sentences = [s.strip() for s in raw_sentences if s.strip()]

    if not sentences:
        return False, None, None

    print("\n--- AI SAFETY CHECKER DEBUG ---")
    print(f"Scanning {len(sentences)} individual sentences...")

    best_match_text = None
    best_distance = 1.0 # Start with max distance
    THRESHOLD = 0.32

    # 2. CHECK EACH SENTENCE INDIVIDUALLY
    for sentence in sentences:
        # Skip 1-word sentences to save processing time
        if len(sentence.split()) < 2:
            continue

        try:
            sentence_vector = get_embedding(sentence)
        except Exception as e:
            print(f"Failed to connect to AI server: {e}")
            return False, None, None

        # Find closest match for THIS specific sentence
        closest_match = HighRiskPhrase.objects.annotate(
            distance=CosineDistance('embedding', sentence_vector)
        ).order_by('distance').first()

        if closest_match:
            # Track the absolute closest match found across the whole journal
            if closest_match.distance < best_distance:
                best_distance = closest_match.distance
                best_match_text = closest_match.text

            # 3. EVALUATE THE DANGER THRESHOLD
            is_dangerous = closest_match.distance < THRESHOLD

            # Stricter rule for very short sentences (e.g. "I am tired")
            if len(sentence.split()) < 4 and closest_match.distance > 0.20:
                is_dangerous = False

            # If THIS sentence is dangerous, immediately trigger the alert!
            if is_dangerous:
                print(f"🚨 DANGER FOUND IN SENTENCE: '{sentence}'")
                print(f"Closest DB Match: '{closest_match.text}' | Distance: {closest_match.distance}")
                print("-------------------------------\n")
                return True, closest_match.text, closest_match.distance

    # 4. IF WE CHECKED ALL SENTENCES AND FOUND NOTHING DANGEROUS
    print("✅ Journal scanned safely. No danger detected.")
    print(f"Closest match overall was '{best_match_text}' with distance {best_distance}")
    print("-------------------------------\n")

    return False, best_match_text, best_distance