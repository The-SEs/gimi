"""
Management command to test drawing emotional analysis pipeline.
Usage: python manage.py test_drawing_analysis

Tests:
1. Ollama connectivity
2. Model availability
3. Basic drawing analysis
"""

import base64
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from wellness.services import (
    get_drawing_emotional_analysis,
    parse_emotional_analysis_json,
    validate_emotional_analysis
)
from PIL import Image
import io
import requests


class Command(BaseCommand):
    help = 'Test drawing emotional analysis pipeline'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Drawing Emotional Analysis Test Suite\n'))
        
        # Test 1: Ollama Connectivity
        self.stdout.write('\n1️⃣  Testing Ollama connectivity...')
        if not self.test_ollama():
            self.stdout.write(self.style.ERROR('❌ Ollama is not accessible'))
            return
        
        # Test 2: Model availability
        self.stdout.write('\n2️⃣  Testing model availability...')
        if not self.test_models():
            self.stdout.write(self.style.ERROR('❌ Required models not available'))
            return
        
        # Test 3: Create test drawing
        self.stdout.write('\n3️⃣  Creating test drawing...')
        test_image_b64 = self.create_test_drawing()
        if not test_image_b64:
            self.stdout.write(self.style.ERROR('❌ Failed to create test drawing'))
            return
        
        # Test 4: Emotional analysis
        self.stdout.write('\n4️⃣  Running emotional analysis...')
        result = get_drawing_emotional_analysis(test_image_b64)
        
        if result is None:
            self.stdout.write(self.style.ERROR('❌ Analysis returned None'))
            return
        
        self.stdout.write(self.style.SUCCESS('✅ Analysis successful'))
        self.stdout.write(f'   Mood: {result.get("mood_label")}')
        self.stdout.write(f'   Confidence: {result.get("confidence")}')
        self.stdout.write(f'   Summary: {result.get("summary")}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ All tests passed! Pipeline is working correctly.'))

    def test_ollama(self) -> bool:
        """Test Ollama server connectivity"""
        try:
            base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
            response = requests.get(f'{base_url}/api/tags', timeout=5)
            if response.status_code == 200:
                self.stdout.write(self.style.SUCCESS(f'✅ Ollama accessible at {base_url}'))
                return True
            else:
                self.stdout.write(self.style.ERROR(f'❌ Ollama returned {response.status_code}'))
                return False
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Cannot reach Ollama: {e}'))
            return False

    def test_models(self) -> bool:
        """Test if required models are available"""
        try:
            base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
            response = requests.get(f'{base_url}/api/tags', timeout=5)
            data = response.json()
            models = [m['name'] for m in data.get('models', [])]
            
            required_models = ['llava', 'llama3.2']
            missing = [m for m in required_models if not any(m in model for model in models)]
            
            if not missing:
                self.stdout.write(self.style.SUCCESS(f'✅ Required models available: {models}'))
                return True
            else:
                self.stdout.write(self.style.ERROR(f'❌ Missing models: {missing}'))
                self.stdout.write(f'   Available models: {models}')
                self.stdout.write(f'   Pull them with: ollama pull llava && ollama pull llama3.2')
                return False
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error checking models: {e}'))
            return False

    def create_test_drawing(self) -> str:
        """Create a simple test drawing image"""
        try:
            # Create a simple image with some shapes
            img = Image.new('RGB', (200, 200), color='white')
            pixels = img.load()
            
            # Draw a simple angry-looking shape (jagged lines)
            for i in range(0, 200, 10):
                pixels[i, 50] = (255, 0, 0)  # Red line (anger)
                pixels[i+5, 50] = (255, 0, 0)
                if i < 100:
                    pixels[100, 50+i] = (255, 0, 0)
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            self.stdout.write(self.style.SUCCESS('✅ Test drawing created'))
            return img_b64
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Failed to create test drawing: {e}'))
            return None
