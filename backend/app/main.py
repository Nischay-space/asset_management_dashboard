from fastapi import FastAPI
from app.routers import assets

app = FastAPI(title="Asset Dashboard API")

app.include_router(assets.router)

@app.get("/")
def read_root():
    return {"message": "Asset dashboard API is running"}