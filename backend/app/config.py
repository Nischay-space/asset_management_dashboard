from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60
    invoice_encryption_key: str

    class Config:
        env_file = ".env"

settings = Settings()