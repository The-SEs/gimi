import json
import aiohttp
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            user_message = data.get("message")

            url = "http://100.93.60.3:11434/api/generate"
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
