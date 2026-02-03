import pytest
import json
from unittest.mock import Mock
import re
import sys
import os

# add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.transcript_processor import (
    TranscriptProcessor,
    StudyNote,
    QuizQuestion,
)

# =========================
# FIXTURES
# =========================

@pytest.fixture
def processor():
    p = TranscriptProcessor(api_key="test-key", enable_ai=False)
    p.client = Mock()
    return p


@pytest.fixture
def sample_transcript():
    return """
    [00:00:10] Today we're going to discuss machine learning algorithms, um,
    particularly focusing on supervised learning.
    You know, supervised learning uses labeled data.
    Classification and regression are common techniques.
    """

# =========================
# CLEANING
# =========================

def test_clean_transcript(processor, sample_transcript):
    cleaned = processor.clean_transcript(sample_transcript)

    assert "um" not in cleaned
    assert "you know" not in cleaned
    assert not re.search(r"\[\d{2}:\d{2}:\d{2}\]", cleaned)
    assert "machine learning" in cleaned
    assert "supervised learning" in cleaned


def test_clean_transcript_empty(processor):
    assert processor.clean_transcript("") == ""

# =========================
# TOPICS
# =========================

def test_extract_topics_success(processor):
    mock_msg = Mock()
    mock_msg.content = "Supervised Learning\nClassification\nRegression"

    processor.client.chat.completions.create.return_value = Mock(
        choices=[Mock(message=mock_msg)]
    )

    topics = processor.extract_topics("sample")

    assert isinstance(topics, list)
    assert len(topics) == 3


def test_extract_topics_api_error(processor):
    processor.client.chat.completions.create.side_effect = Exception("API failure")

    topics = processor.extract_topics("sample")
    assert isinstance(topics, list)
    assert len(topics) >= 1

# =========================
# STUDY NOTES
# =========================

def test_generate_study_notes_success(processor):
    mock_msg = Mock()
    mock_msg.content = json.dumps({
        "summary": "Supervised learning trains models using labeled data.",
        "key_concepts": ["Labeled Data"],
        "subtopics": ["Classification"],
        "examples": ["Spam detection"],
        "important_points": ["Needs labels"]
    })

    processor.client.chat.completions.create.return_value = Mock(
        choices=[Mock(message=mock_msg)]
    )

    notes = processor.generate_study_notes("sample", ["Supervised Learning"])

    assert len(notes) == 1
    assert isinstance(notes[0], StudyNote)
    assert notes[0].topic == "Supervised Learning"


def test_generate_study_notes_json_error(processor):
    mock_msg = Mock()
    mock_msg.content = "INVALID JSON"

    processor.client.chat.completions.create.return_value = Mock(
        choices=[Mock(message=mock_msg)]
    )

    notes = processor.generate_study_notes("sample", ["ML"])

    assert len(notes) == 1
    assert isinstance(notes[0], StudyNote)

# =========================
# QUIZ
# =========================

def test_generate_quiz_questions(processor):
    notes = [
        StudyNote("ML", "summary", [], [], [], [])
    ]

    mock_msg = Mock()
    mock_msg.content = json.dumps({
        "questions": [{
            "question": "What is ML?",
            "options": ["A)", "B)", "C)", "D)"],
            "correct_answer": 0,
            "explanation": "Machine Learning"
        }]
    })

    processor.client.chat.completions.create.return_value = Mock(
        choices=[Mock(message=mock_msg)]
    )

    quiz = processor.generate_quiz_questions(notes, 1)

    assert isinstance(quiz, list)
    assert isinstance(quiz[0], QuizQuestion)

# =========================
# FORMATTING
# =========================

def test_format_study_notes_output(processor):
    notes = [
        StudyNote(
            topic="Machine Learning",
            summary="ML summary",
            key_concepts=["Training"],
            subtopics=["Classification"],
            examples=["Spam"],
            important_points=["Avoid overfitting"]
        )
    ]

    output = processor.format_study_notes_output(notes)

    assert "# 📚 AI-Generated Study Notes" in output
    assert "Machine Learning" in output
    assert "Spam" in output

# =========================
# FULL PIPELINE
# =========================

def test_process_transcript_complete_flow(processor, sample_transcript):
    processor.extract_topics = Mock(return_value=["Topic"])
    processor.generate_study_notes = Mock(
        return_value=[StudyNote("Topic", "", [], [], [], [])]
    )
    processor.generate_quiz_questions = Mock(return_value=[])

    result = processor.process_transcript(sample_transcript)

    assert "topics" in result
    assert "study_notes" in result
    assert "quiz_questions" in result
    assert isinstance(result["study_notes"], list)

# =========================
# INTEGRATION
# =========================

def test_special_characters():
    processor = TranscriptProcessor("test-key", enable_ai=False)
    text = "AI & ML (2024) @ OpenAI"
    cleaned = processor.clean_transcript(text)

    assert "&" in cleaned
    assert "(" in cleaned
    assert "@" in cleaned
