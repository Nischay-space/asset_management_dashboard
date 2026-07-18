from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import assets, upload, auth_router, users, invoices, duplicates, search

app = FastAPI(title="Asset Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(upload.router)
app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(invoices.router)
app.include_router(duplicates.router)
app.include_router(search.router)


@app.get("/")
def read_root():
    return {"message": "Asset dashboard API is running"}