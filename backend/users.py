# backend/users.py
# still safe to import

fake_users_db = {
    "test@example.com": {
        "email": "test@example.com",
        "name": "Test User",
        # pre-generated hash (DO NOT hash here)
        "hashed_password": "$2b$12$REPLACE_WITH_YOUR_HASH",
    }
}
