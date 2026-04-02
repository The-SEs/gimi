from http.cookies import SimpleCookie
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@database_sync_to_async
def get_user_from_jwt(token_key):
    try:
        # Decode the JWT found in the cookie
        access_token = AccessToken(token_key)
        user = User.objects.get(id=access_token['user_id'])
        print(f"✅ SUCCESS: WebSocket authenticated as {user.email}")
        return user
    except Exception as e:
        print(f"❌ JWT ERROR: {e}")
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # 1. Look for the 'cookie' header in the WebSocket handshake
        headers = dict(scope.get("headers", [b'']))
        cookie_header = headers.get(b"cookie", b"").decode("utf-8")

        token_key = None
        if cookie_header:
            cookies = SimpleCookie(cookie_header)
            # This matches your 'auth-cookie' from the screenshot!
            if "auth-cookie" in cookies:
                token_key = cookies["auth-cookie"].value

        # 2. Authenticate the user
        if token_key:
            scope["user"] = await get_user_from_jwt(token_key)
        else:
            print("⚠️ FAILED: No 'auth-cookie' found in headers")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)