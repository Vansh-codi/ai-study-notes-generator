# backend/users.py
from auth import hash_password


fake_users_db = {
    "test@example.com": {
        "email": "test@example.com",
        "name": "Test User",
        "hashed_password": hash_password("demo_password_only"),

    }
}
