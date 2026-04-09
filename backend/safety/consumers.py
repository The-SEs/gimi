import json
import aiohttp
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async  # <-- 1. Import this tool
from wellness.models import ChatMessage
from safety.ai_utils import get_hardcoded_summary
from wellness.views import get_smart_snippet
from safety.services import check_journal  # <-- 2. Import your safety logic
import os
from dotenv import load_dotenv
from safety.models import SafetyFlag

load_dotenv()
BASE_URL = os.getenv("OLLAMA_BASE_URL")


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("guidance_alerts", self.channel_name)

    async def disconnect(self, code):
        await self.channel_layer.group_discard("guidance_alerts", self.channel_name)

    async def safety_alert(self, event):
        await self.send(text_data=json.dumps(event))

    # consumers.py

    async def handle_safety_alert(self, user, message, matched_phrase):
        # We still generate the snippet for the console/logs if you want
        snippet = await sync_to_async(get_smart_snippet)(message, matched_phrase)
        ai_summary = get_hardcoded_summary(matched_phrase, snippet)

        # 🚩 THE FIX: Save 'message' (the full content), NOT 'snippet'
        await sync_to_async(SafetyFlag.objects.create)(
            user=user,
            flagged_text=message,  # <--- Save the WHOLE thing here
            ai_summary=ai_summary,
            matched_phrases=[matched_phrase] if matched_phrase else [],
            risk_level="High",
        )

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            user_message = data.get("message")
            user = self.scope.get("user")

            # --- 1. SAVE THE USER'S MESSAGE FIRST ---
            # We do this immediately so we never lose what the student said.
            if user and user.is_authenticated:
                await sync_to_async(ChatMessage.objects.create)(
                    user=user, sender="user", text=user_message
                )
            else:
                print("Warning: Unauthenticated user. Chat message not saved.")
            # ----------------------------------------

            # 3. Safely run the synchronous DB check for danger
            is_dangerous, matched_phrase, distance = await sync_to_async(check_journal)(
                user_message
            )

            if is_dangerous:
                # Safely attempt to save to the database without crashing the chat
                if user and user.is_authenticated:
                    await self.handle_safety_alert(user, user_message, matched_phrase)

                # Send warning to frontend
                warning_message = "We noticed you might be going through a tough time. Would you like to schedule a talk with the school counselor?"

                # --- 2A. SAVE GIMI'S WARNING MESSAGE ---
                if user and user.is_authenticated:
                    await sync_to_async(ChatMessage.objects.create)(
                        user=user, sender="gimi", text=warning_message
                    )
                # ---------------------------------------

                await self.send(
                    text_data=json.dumps(
                        {
                            "message": warning_message,
                            "done": True,
                            "status": "high_risk",
                        }
                    )
                )
                return

            # 5. IF SAFE, PROCEED WITH OLLAMA STREAMING
            url = f"{BASE_URL}/api/generate"
            payload = {"model": "llama3.2", "prompt": user_message, "stream": True}

            full_bot_response = ""

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

                                full_bot_response += content

                                # Send the token to the React frontend INSTANTLY
                                await self.send(
                                    text_data=json.dumps(
                                        {
                                            "message": content,
                                            "done": chunk.get("done", False),
                                        }
                                    )
                                )

                # --- 2B. SAVE GIMI'S FULL MESSAGE ---
                # This happens after the stream finishes successfully
                if user and user.is_authenticated:
                    await sync_to_async(ChatMessage.objects.create)(
                        user=user, sender="gimi", text=full_bot_response
                    )
                # ------------------------------------

            except Exception as e:
                await self.send(text_data=json.dumps({"error": str(e)}))

