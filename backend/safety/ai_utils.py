import requests

def get_embedding(text):
    # points to the Ollama running on server
    url = "http://100.100.111.14:11434/api/embed"

    payload = {
        "model": "nomic-embed-text",
        "input": text
    }

    response = requests.post(url, json=payload)
    response.raise_for_status() # tells us if server is unreachable

    # Returns the array of 768 math coordinates
    return response.json()["embeddings"][0]