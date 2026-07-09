from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

db = SessionLocal()

admin = User(
    name="Nischay",
    email="admin@example.com",
    password_hash=hash_password("adminpass123"),
    role="admin",
)

db.add(admin)
db.commit()
print("Admin user created with id:", admin.id)

db.close()