from cryptography.fernet import Fernet
from app.config import settings

_fernet = Fernet(settings.invoice_encryption_key.encode())


def encrypt_bytes(data: bytes) -> bytes:
    return _fernet.encrypt(data)


def decrypt_bytes(data: bytes) -> bytes:
    return _fernet.decrypt(data)