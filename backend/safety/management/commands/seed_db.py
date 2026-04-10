from django.core.management.base import BaseCommand
from safety.models import HighRiskPhrase
from safety.ai_utils import get_embedding

class Command(BaseCommand):
    help = 'Seeds the vector database with High-Risk Phrases'

    def handle(self, *args, **kwargs):
        # Massive list of red flag phrases in English, Tagalog, Bisaya, and Slang
        red_phrases = [
            # --- ENGLISH: Direct & Indirect ---
            "I want to kill myself.",
            "I want to die.",
            "I am going to end it all.",
            "I have a plan to hurt myself.",
            "I can't take this pain anymore.",
            "I'm thinking of killing myself.",
            "I don't want to wake up tomorrow.",
            "Everyone would be better off without me.",
            "There is no point in living.",
            "I just want to disappear forever.",
            "I feel like a burden to everyone.",
            "I want to hurt someone.",
            "I am going to make them pay.",
            "I am writing my goodbyes.",
            "I just want the pain to stop.",
            "I don't see a future for myself anymore.",
            "I'm going to jump.",
            "Taking pills to sleep forever.",
            "I feel completely empty inside.",
            "Nobody would care if I was gone.",

            # --- TAGALOG (Filipino) ---
            "Gusto ko na mamatay.",
            "Ayoko na, pagod na ako mabuhay.",
            "Sana hindi na ako magising.",
            "Pagod na pagod na ako sa buhay.",
            "Wala nang kwenta ang buhay ko.",
            "Gusto kong manakit ng ibang tao.",
            "Tapusin ko na kaya lahat.",
            "Sana kunin na ako ni Lord.",
            "Wala na akong pag-asa.",
            "Gusto ko na magpakamatay.",
            "Pabigat lang ako sa pamilya ko.",
            "Wala na silang pakialam sa akin.",
            "Hindi ko na kaya ituloy.",
            "Gusto ko na lang sumuko.",

            # --- BISAYA / CEBUANO ---
            "Gusto na ko mawala.",
            "Gikapoy na ko sa tanan, lami na i-give up.",
            "Gusto na ko mamatay.",
            "Kapoy na kaayo mabuhi.",
            "Wala na koy rason para mabuhi.",
            "Maypa mamatay nalang ko.",
            "Wala na koy pulos.",
            "Gusto nako tapuson ang tanan.",
            "Lami na kaayo magpakamatay.",
            "Dili na nako kaya.",
            "Lami na i-ambak.",
            "Mas maayo pa guro mawa ko.",
            "Pabigat ra ko sa tanan.",
            "Maypag mawala sa kalibutan.",
            "Hapit na ko mo-give up.",
            "Wala nay pag-asa akong kinabuhi.",

            # --- INTERNET SLANG / FILTER EVASION ---
            "kms",
            "i wanna unalive myself",
            "killy0urself",
            "rope maxxing",
            "catch the bus",
            "commit sewerslide",
            "commit toaster bath",
            "alt f4 irl",
            "become past tense",
            "checking out early",
            "game over for me",
            "delete myself",
            "k ys",
            "end my sub"
        ]

        self.stdout.write("Connecting to AI server to generate embeddings...")

        for text in red_phrases:
            try:
                # Ask server to do the math
                vector = get_embedding(text)

                # Save to postgres db
                HighRiskPhrase.objects.update_or_create(
                    text=text,
                    defaults={'embedding': vector}
                )

                self.stdout.write(self.style.SUCCESS(f"✅ Saved: '{text}'"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Failed '{text}': {e}"))

        self.stdout.write(self.style.SUCCESS("Database seeding complete!"))