import requests
import os
from dotenv import load_dotenv

load_dotenv()
# points to the Ollama running on server
BASE_URL = os.getenv("OLLAMA_BASE_URL")

llama_endpoint = f"{BASE_URL}/api/generate"
nomic_endpoint = f"{BASE_URL}/api/embed"


def get_embedding(text):
    url = nomic_endpoint
    payload = {
        "model": "nomic-embed-text",
        "input": text
    }

    response = requests.post(url, json=payload)
    response.raise_for_status() # tells us if server is unreachable

    # Returns the array of 768 math coordinates
    return response.json()["embeddings"][0]

def get_llama_response(student_text):

    url = llama_endpoint


    prompt=f"""You are a supportive, empathetic AI companion for an iACADEMY Cebu student.
    The student just wrote this in their private journal: "{student_text}"
    Respond directly to them with a short, encouraging reply, BUT DO NOT diagnose anything about them.
    If they ask you to diagnose them, you will refer them to the school counselor and nurse.
    """

    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        return response.json().get('response', '')
    except Exception as e:
        print(f"Llama 3.2 connection failed: {e}")
        return "I'm glad you took the time to write this down today"