from django.core.management.base import BaseCommand
from safety.models import HighRiskPhrase
from safety.ai_utils import get_embedding

class Command(BaseCommand):
    help = 'Seeds the vector database with High-Risk Phrases'

    def handle(self, *args, **kwargs):

        # red flag phrases
        red_phrases = [
            "I want to end it all",
            "I can't take this pain anymore",
            "Everyone would be better off without me",
            "I'm thinking of killing myself",
            "Gusto na ko mawala",
            "Gikapoy na ko sa tanan, lami na i-give up",
            "Ayoko na, pagod na ako mabuhay",
            "Wala na koy rason para mabuhi"
        ]

        self.stdout.write("Connecting to server")

        for text in red_phrases:
            try:
                # Ask server to do the math
                vector = get_embedding(text)

                # Save to postgres db
                HighRiskPhrase.objects.update_or_create(
                    text=text,
                    defaults={'embedding': vector}
                )

                self.stdout.write(self.style.SUCCESS(f"✅ Saved: '{text}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Failed '{text}': {e}"))
        self.stdout.write(self.style.SUCCESS("Database seeding complete"))
