from fastapi import FastAPI
from app.routes import rides
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")

if not GMAPS_API_KEY:
    raise RuntimeError("Google Maps API key is missing. Set GMAPS_API_KEY in the .env file.")

app = FastAPI(
    title="Carpooling API",
    description="API to manage carpooling logic for events.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Add your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(rides.router, prefix="/rides", tags=["User Assignment"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Carpooling API"}