import sys
from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

if len(sys.argv) != 5:
    print("Usage: python create_admin.py <name> <email> <password> <role>")
    sys.exit(1)

name, email, password, role = sys.argv[1:5]

if role not in ("admin", "viewer"):
    print("Role must be 'admin' or 'viewer'")
    sys.exit(1)

db = SessionLocal()

existing = db.query(User).filter(User.email == email).first()
if existing:
    print(f"A user with email {email} already exists (id: {existing.id})")
    db.close()
    sys.exit(1)

user = User(
    name=name,
    email=email,
    password_hash=hash_password(password),
    role=role,
)

db.add(user)
db.commit()
print(f"{role.capitalize()} user created: {name} ({email}), id: {user.id}")

db.close()