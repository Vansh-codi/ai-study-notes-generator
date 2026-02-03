import os
import re
import json
from dataclasses import dataclass
from typing import List, Optional

from openai import OpenAI

# Optional Ollama imports
try:
    from .local_llm import call_ollama, call_ollama_quiz
except Exception:
    call_ollama = None
    call_ollama_quiz = None


OPENAI_MODEL = "gpt-4.1-mini"


# =========================
# DATA MODELS
# =========================

@dataclass
class StudyNote:
    topic: str
    summary: str
    key_concepts: List[str]
    subtopics: List[str]
    examples: List[str]
    important_points: List[str]


@dataclass
class QuizQuestion:
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    topic: str


# =========================
# PROCESSOR
# =========================

class TranscriptProcessor:
    """
    Modes:
    - off     → tests
    - ollama  → local only
    - openai  → OpenAI only
    - auto    → Ollama → OpenAI fallback
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        enable_ai: bool = True,
        mode: str = "auto",
    ):
        self.enable_ai = enable_ai
        self.mode = mode
        self.last_used_mode: Optional[str] = None

        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client: Optional[OpenAI] = None

        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)

    # -------------------------
    # CLEANING
    # -------------------------

    def clean_transcript(self, text: str) -> str:
        if not text:
            return ""

        text = re.sub(r"\[\d{2}:\d{2}:\d{2}\]", "", text)
        fillers = ["um", "uh", "you know", "like", "basically"]
        text = text.lower()

        for f in fillers:
            text = text.replace(f, "")

        return re.sub(r"\s+", " ", text).strip()

    # -------------------------
    # TOPICS
    # -------------------------

    def extract_topics(self, transcript: str) -> List[str]:
        if not self.client:
            return ["Core Concepts"]

        try:
            res = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Extract concise topic titles."},
                    {"role": "user", "content": transcript},
                ],
                temperature=0.3,
            )

            lines = res.choices[0].message.content.splitlines()
            topics = [l.strip("-•0123456789. ") for l in lines if l.strip()]

            return topics or ["Core Concepts"]

        except Exception:
            return ["Core Concepts"]

    # -------------------------
    # STUDY NOTES
    # -------------------------

    def generate_study_notes(self, transcript: str, topics: List[str]) -> List[StudyNote]:
        notes: List[StudyNote] = []

        for topic in topics:
            try:
                res = self.client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "Create structured study notes in JSON."},
                        {"role": "user", "content": f"Topic: {topic}\n\n{transcript}"},
                    ],
                    temperature=0.4,
                )

                data = json.loads(res.choices[0].message.content)

                notes.append(
                    StudyNote(
                        topic=topic,
                        summary=data.get("summary", ""),
                        key_concepts=data.get("key_concepts", []),
                        subtopics=data.get("subtopics", []),
                        examples=data.get("examples", []),
                        important_points=data.get("important_points", []),
                    )
                )

            except Exception:
                notes.append(
                    StudyNote(
                        topic=topic,
                        summary=f"{topic} explained based on the transcript.",
                        key_concepts=[topic],
                        subtopics=["Basics", "Applications"],
                        examples=["Spam filtering"],
                        important_points=["Important concept"],
                    )
                )

        return notes

    # -------------------------
    # QUIZ (FIXED ✅)
    # -------------------------

    def generate_quiz_questions(self, notes: List[StudyNote], total: int) -> List[QuizQuestion]:
        if not self.client:
            return []

        quiz: List[QuizQuestion] = []

        try:
            res = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "Generate multiple-choice questions. Return JSON only."
                    },
                    {
                        "role": "user",
                        "content": f"""
Create {total} quiz questions based on these notes:

{notes[0].summary}

Return JSON:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": 0,
      "explanation": "..."
    }}
  ]
}}
"""
                    }
                ],
                temperature=0.5,
            )

            data = json.loads(res.choices[0].message.content)

            for q in data.get("questions", []):
                quiz.append(
                    QuizQuestion(
                        question=q["question"],
                        options=q["options"],
                        correct_answer=q["correct_answer"],
                        explanation=q["explanation"],
                        topic=notes[0].topic,
                    )
                )

        except Exception as e:
            print("⚠️ OpenAI quiz failed:", e)

        return quiz[:total]

    # -------------------------
    # PIPELINE
    # -------------------------

    def process_transcript(
        self,
        transcript: str,
        generate_quiz: bool = True,
        num_quiz_questions: int = 5,
        save_files: bool = False,
    ):
        cleaned = self.clean_transcript(transcript)

        # 🧪 OFF / TEST MODE
        if not self.enable_ai or self.mode == "off":
            self.last_used_mode = "off"
            topics = self.extract_topics(cleaned)
            notes = self.generate_study_notes(cleaned, topics)
            quiz = self.generate_quiz_questions(notes, num_quiz_questions)

            return {
                "mode": self.last_used_mode,
                "topics": topics,
                "study_notes": notes,
                "quiz_questions": quiz,
            }

        # 🟢 OLLAMA FIRST
        if self.mode in ("ollama", "auto") and call_ollama:
            try:
                self.last_used_mode = "ollama"
                print("🟢 Using Ollama")

                return {
                    "mode": "ollama",
                    "topics": ["Generated by Local AI"],
                    "study_notes": call_ollama(cleaned),
                    "quiz_questions": call_ollama_quiz(cleaned, num_quiz_questions) if generate_quiz else "",
                }

            except Exception as e:
                print("⚠️ Ollama failed:", e)

        # 🔵 OPENAI FALLBACK
        self.last_used_mode = "openai"
        print("🔵 Using OpenAI")

        topics = self.extract_topics(cleaned)
        notes = self.generate_study_notes(cleaned, topics)
        quiz = self.generate_quiz_questions(notes, num_quiz_questions)

        return {
            "mode": "openai",
            "topics": topics,
            "study_notes": notes,
            "quiz_questions": quiz,
        }
