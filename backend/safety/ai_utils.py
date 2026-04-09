import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Get the base URL and aggressively strip any accidental paths or slashes from the .env
raw_url = os.getenv("OLLAMA_BASE_URL", "http://172.17.0.1:11434")
BASE_URL = raw_url.split("/api")[0].split("/v1")[0].rstrip("/")

llama_endpoint = f"{BASE_URL}/api/generate"
nomic_endpoint = f"{BASE_URL}/api/embed"


def get_embedding(text):
    url = nomic_endpoint
    payload = {"model": "nomic-embed-text", "input": text}

    response = requests.post(url, json=payload)

    if not response.ok:
        # This will show exactly what URL was attempted so we can debug if it fails again
        raise Exception(
            f"Ollama failed! Tried URL: {url} | Status: {response.status_code} | Response: {response.text}"
        )

    return response.json()["embeddings"][0]


def get_llama_response(prompt):
    url = llama_endpoint
    payload = {"model": "llama3.2", "prompt": prompt, "stream": False}

    try:
        response = requests.post(url, json=payload, timeout=15)
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as e:
        print(f"Llama 3.2 connection failed on {url}: {e}")
        return ""


def get_hardcoded_summary(matched_phrase, snippet):
    risk_map = {
        "kill": "Student expresses severe intent or ideation regarding self-harm.",
        "die": "High-risk linguistic markers for hopelessness and suicidal ideation.",
        "hurt": "Potential for self-directed or outward-directed physical aggression.",
        "depressed": "Significant depressive valence detected. Suggests acute emotional distress.",
        "help": "Direct plea for assistance associated with high-risk emotional states.",
    }

    category = "General safety risk"
    for key in risk_map:
        if key in matched_phrase.lower():
            category = risk_map[key]
            break

    return f"ANALYSIS: {category} | CONTEXT: The phrase '{matched_phrase}' was detected in a high-stress context: {snippet}"
