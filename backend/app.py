from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from auth import verify_password, create_access_token , hash_password

from users import fake_users_db
# from backend.auth import verify_password, create_access_token, hash_password
# from backend.users import fake_users_db






print(">>> BACKEND APP.PY LOADED <<<")


from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import traceback

from transcript_processor import TranscriptProcessor


# --------------------------------------------------
# App setup
# --------------------------------------------------
app = FastAPI(
    title="AI Study Notes Generator",
    version="0.1.0"
)

# --------------------------------------------------
# Serve Frontend (IMPORTANT)
# --------------------------------------------------
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
def serve_frontend():
    return FileResponse("frontend/index.html")


# --------------------------------------------------
# AI Processor
# --------------------------------------------------
# AUTO MODE: Ollama → OpenAI fallback
processor = TranscriptProcessor(mode="auto")


# --------------------------------------------------
# Request Model
# --------------------------------------------------
class TranscriptInput(BaseModel):
    transcript: str
    generate_quiz: bool = True
    num_questions: int = 3


# --------------------------------------------------
# Generate Endpoint
# --------------------------------------------------
@app.post("/generate")
def generate_notes(data: TranscriptInput):
    try:
        print(">>> /generate CALLED <<<")

        result = processor.process_transcript(
            transcript=data.transcript,
            generate_quiz=data.generate_quiz,
            num_quiz_questions=data.num_questions,
            save_files=True,
        )

        # =================================================
        # 🟢 OLLAMA MODE (plain text)
        # =================================================
        if isinstance(result["study_notes"], str):
            return {
                "mode": result.get("mode", "ollama"),
                "topics": result["topics"],
                "study_notes": result["study_notes"],
                "quiz": result["quiz_questions"],
            }

        # =================================================
        # 🔵 OPENAI MODE (structured → formatted)
        # =================================================
        formatted_notes = ""

        for i, note in enumerate(result["study_notes"], 1):
            formatted_notes += f"## {i}. {note.topic}\n\n"
            formatted_notes += f"**Summary:** {note.summary}\n\n"

            if note.key_concepts:
                formatted_notes += "**Key Concepts:**\n"
                formatted_notes += "\n".join(f"- {k}" for k in note.key_concepts)
                formatted_notes += "\n\n"

            if note.subtopics:
                formatted_notes += "**Subtopics:**\n"
                formatted_notes += "\n".join(f"- {s}" for s in note.subtopics)
                formatted_notes += "\n\n"

            if note.examples:
                formatted_notes += "**Examples:**\n"
                formatted_notes += "\n".join(f"- {e}" for e in note.examples)
                formatted_notes += "\n\n"

            if note.important_points:
                formatted_notes += "**Important Points:**\n"
                formatted_notes += "\n".join(f"- {p}" for p in note.important_points)
                formatted_notes += "\n\n"

            formatted_notes += "---\n\n"

        formatted_quiz = ""
        for i, q in enumerate(result["quiz_questions"], 1):
            formatted_quiz += f"Q{i}: {q.question}\n"
            for opt in q.options:
                formatted_quiz += f"{opt}\n"
            formatted_quiz += f"Answer: {q.options[q.correct_answer]}\n\n"

        return {
            "mode": result.get("mode", "openai"),
            "topics": result["topics"],
            "study_notes": formatted_notes,
            "quiz": formatted_quiz,
        }

    except Exception as e:
        print("❌ FULL TRACEBACK:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")


# --------------------------------------------------
# Download Endpoints
# --------------------------------------------------
@app.get("/download/notes")
def download_notes():
    return FileResponse(
        path="output/study_notes.md",
        filename="study_notes.md",
        media_type="text/markdown",
    )


@app.get("/download/quiz")
def download_quiz():
    return FileResponse(
        path="output/practice_quiz.md",
        filename="practice_quiz.md",
        media_type="text/markdown",
    )
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(data: LoginRequest):
    user = fake_users_db.get(data.email)

    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["email"],
        "name": user["name"]
    })

    return {
        "access_token": token,
        "user": {
            "email": user["email"],
            "name": user["name"]
        }
    }

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/signup")
def signup(data: SignupRequest):
    if data.email in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    fake_users_db[data.email] = {
        "email": data.email,
        "name": data.name,
        "hashed_password": hash_password(data.password),
    }

    return {
        "message": "User created successfully",
        "user": {
            "email": data.email,
            "name": data.name
        }
    }

@app.get("/debug/users")
def get_users():
    return list(fake_users_db.keys())

