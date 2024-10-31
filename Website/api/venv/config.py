from dotenv import load_dotenv
import os
import redis

load_dotenv()

class ApplicationConfig:

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = f"postgresql://postgres:{os.getenv('DATABASE_PASSWORD')}@localhost:5432/Capstone"

    SESSION_TYPE="redis"
    SESSION_PERMANENT=False
    SESSION_USE_SIGNER=True
    SESSION_REDIS = redis.from_url("redis://127.0.0.1:6379")