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

def get_llama_response(prompt):

    url = llama_endpoint
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        return response.json().get('response', '').strip()
    except Exception as e:
        print(f"Llama 3.2 connection failed: {e}")
        return "" # Return empty on failure

def get_hardcoded_summary(matched_phrase, snippet):
    # Mapping triggers to professional clinical categories
    risk_map = {
        "kill": "Student expresses severe intent or ideation regarding self-harm.",
        "die": "High-risk linguistic markers for hopelessness and suicidal ideation.",
        "hurt": "Potential for self-directed or outward-directed physical aggression.",
        "depressed": "Significant depressive valence detected. Suggests acute emotional distress.",
        "help": "Direct plea for assistance associated with high-risk emotional states."
    }

    # Find the best match or use a generic "Professional Review" message
    category = "General safety risk"
    for key in risk_map:
        if key in matched_phrase.lower():
            category = risk_map[key]
            break

    # Construct the final summary
    return f"ANALYSIS: {category} | CONTEXT: The phrase '{matched_phrase}' was detected in a high-stress context: {snippet}"
