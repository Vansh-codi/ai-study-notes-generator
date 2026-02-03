from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    files = client.files.list()
    print("📁 Uploaded files:")
    for f in files.data:
        print(f"- {f.filename}")
except Exception as e:
    print("❌ Error fetching files:", e)
