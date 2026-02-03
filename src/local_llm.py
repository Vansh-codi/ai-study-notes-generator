import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3"

def call_ollama(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )
    response.raise_for_status()
    return response.json()["response"]
def call_ollama_quiz(transcript: str, num_questions: int = 3) -> str:
    prompt = f"""
Create {num_questions} multiple-choice questions from the transcript.
Each question should have 4 options and clearly indicate the correct answer.

Transcript:
{transcript}
"""
    return call_ollama(prompt)


