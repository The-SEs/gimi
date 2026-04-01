import json
import aiohttp
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async  # <-- 1. Import this tool
from safety.services import check_journal  # <-- 2. Import your safety logic
import os
from dotenv import load_dotenv

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
            is_dangerous, matched_phrase, distance = await sync_to_async(check_journal)(user_message)

            if is_dangerous:
                # 4. If dangerous, send the safety message and STOP.
                warning_message = "We noticed you might be going through a tough time. Would you like to schedule a talk with the school counselor?"

                await self.send(text_data=json.dumps({
                    "message": warning_message,
                    "done": True,
                    "is_flagged": True  # You can use this flag in React to turn the message red!
                }))

                return  # <-- CRITICAL: Exit the function so Ollama is never called
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