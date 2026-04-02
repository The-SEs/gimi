import json
import aiohttp
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async  # <-- 1. Import this tool
from safety.services import check_journal  # <-- 2. Import your safety logic
import os
from dotenv import load_dotenv
from safety.models import SafetyFlag

load_dotenv()
BASE_URL = os.getenv("OLLAMA_BASE_URL")

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            user_message = data.get("message")

            # --- THE INTERCEPTOR ---
            # 3. Safely run the synchronous DB check inside this async environment
            # --- THE INTERCEPTOR ---
            is_dangerous, matched_phrase, distance = await sync_to_async(check_journal)(user_message)

            if is_dangerous:
                # 1. Safely attempt to save to the database without crashing the chat
                try:
                    user = self.scope.get("user")
                    if user and user.is_authenticated:
                        await sync_to_async(SafetyFlag.objects.create)(
                            user=user,
                            flagged_text=user_message,
                            matched_phrases=[matched_phrase] if matched_phrase else [],
                            risk_level='High'
                        )
                    else:
                        print("WARNING: High risk detected, but WebSocket user is not authenticated.")
                except Exception as e:
                    print(f"Error saving SafetyFlag: {e}")

                # 2. Send warning to frontend (This will now ALWAYS trigger!)
                warning_message = "We noticed you might be going through a tough time. Would you like to schedule a talk with the school counselor?"

                await self.send(text_data=json.dumps({
                    "message": warning_message,
                    "done": True,
                    "status": "high_risk"
                }))

                return
            # -----------------------

            # 5. IF SAFE, PROCEED WITH OLLAMA STREAMING
            url = f"{BASE_URL}/api/generate"
            payload = {"model": "llama3.2", "prompt": user_message, "stream": True}

            try:
                # Open an asynchronous HTTP session
                async with aiohttp.ClientSession() as session:
                    # Make the request to Ollama
                    async with session.post(url, json=payload) as response:

                        # Asynchronously read the streaming lines as they arrive
                        async for line in response.content:
                            if line:
                                # Decode the bytes to string and parse JSON
                                chunk = json.loads(line.decode("utf-8"))
                                content = chunk.get("response", "")

                                # Send the token to the React frontend INSTANTLY
                                await self.send(
                                    text_data=json.dumps(
                                        {
                                            "message": content,
                                            "done": chunk.get("done", False),
                                        }
                                    )
                                )
            except Exception as e:
                await self.send(text_data=json.dumps({"error": str(e)}))