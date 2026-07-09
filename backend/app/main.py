from fastapi import FastAPI
from app.routers import assets, upload

app = FastAPI(title="Asset Dashboard API")

app.include_router(assets.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Asset dashboard API is running"}