import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from os.path import dirname, join
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), ".env")
load_dotenv(dotenv_path)

VONAGE_API_KEY = os.getenv('VONAGE_API_KEY')
VONAGE_API_SECRET = os.getenv('VONAGE_API_SECRET')
SMS_TO_NUMBER = os.getenv("SMS_TO_NUMBER")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID")

# Message schema
class Message(BaseModel):
    role: str
    transcript: str

class Messages(BaseModel):
    messages: List[Message]

class NotificationRequest(BaseModel):
    text: str

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

@app.post("/api/send_notification")
def send_notification(request: NotificationRequest):
    from vonage import Auth, Vonage
    from vonage_sms import SmsMessage, SmsResponse

    # Initialize Vonage client
    vonage_client = Vonage(Auth(api_key=VONAGE_API_KEY, api_secret=VONAGE_API_SECRET))

    message = SmsMessage(
        to=SMS_TO_NUMBER,
        from_=SMS_SENDER_ID,
        text=request.text,
    )
    response: SmsResponse = vonage_client.sms.send(message)
    return {"status": "sent", "response": response.dict()}

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