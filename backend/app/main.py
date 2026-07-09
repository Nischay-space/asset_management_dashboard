from fastapi import FastAPI
from app.routers import assets, upload, auth_router

app = FastAPI(title="Asset Dashboard API")

app.include_router(assets.router)
app.include_router(upload.router)
app.include_router(auth_router.router)

@app.get("/")
def read_root():
    return {"message": "Asset dashboard API is running"}