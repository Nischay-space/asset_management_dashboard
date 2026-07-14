import os
import uuid

UPLOAD_DIR = "uploads/invoices"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_file(content: bytes, original_filename: str) -> tuple[str, str]:
    extension = original_filename.rsplit(".", 1)[-1].lower()
    generated_name = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, generated_name)

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path, generated_name


def read_file(file_path: str) -> bytes:
    with open(file_path, "rb") as f:
        return f.read()


def delete_file(file_path: str) -> None:
    if os.path.exists(file_path):
        os.remove(file_path)