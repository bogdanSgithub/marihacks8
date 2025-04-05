import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

# Message schema
class Message(BaseModel):
    role: str
    transcript: str

class Messages(BaseModel):
    messages: List[Message]

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory DB
memory_db = {"messages": []}

# Static frontend folder
build_folder = os.path.abspath("../frontend/build")

# Routes
@app.get("/api/messages", response_model=Messages)
def get_messages():
    return Messages(messages=memory_db["messages"])

@app.post("/api/messages")
def add_message(message: Message):
    memory_db["messages"].append(message)
    return message

# Serve React frontend
'''
app.mount("/static", StaticFiles(directory=os.path.join(build_folder, "static")), name="static")

@app.get("/{filename:path}")
async def serve_frontend(filename: str = "index.html"):
    file_path = os.path.join(build_folder, filename)
    if not os.path.isfile(file_path):
        file_path = os.path.join(build_folder, "index.html")
    return FileResponse(file_path)
'''