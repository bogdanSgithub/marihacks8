import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from difflib import SequenceMatcher
from dotenv import load_dotenv
load_dotenv()

VONAGE_API_KEY = os.environ.get('VONAGE_API_KEY')
VONAGE_API_SECRET = os.environ.get('VONAGE_API_SECRET')
SMS_TO_NUMBER = os.environ.get("SMS_TO_NUMBER")
SMS_SENDER_ID = os.environ.get("SMS_SENDER_ID")

class Call(BaseModel):
    call_id: str
    phone_number: str

class Message(BaseModel):
    role: str
    transcript: str
    call_id: str
    phone_number: str

class MessagePublic(BaseModel):
    role: str
    transcript: str

class Messages(BaseModel):
    messages: List[MessagePublic]

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
memory_db: Dict[str, List[Message]] = {"messages": []}
calls: Dict[str, Call] = {}

# Static frontend folder
build_folder = os.path.abspath("../frontend/build")

# Routes
@app.get("/api/messages", response_model=Messages)
def get_messages(call_id: str = Query(...)):
    filtered = [
        MessagePublic(role=msg.role, transcript=msg.transcript)
        for msg in memory_db["messages"]
        if msg.call_id == call_id
    ]

    # Also include the currently buffered message if it matches
    if (
        current_buffer["message"] and
        current_buffer["call_id"] == call_id
    ):
        buffered_msg = current_buffer["message"]
        filtered.append(
            MessagePublic(role=buffered_msg.role, transcript=buffered_msg.transcript)
        )

    return Messages(messages=filtered)

current_buffer = {
    "call_id": None,
    "role": None,
    "message": None
}

@app.post("/api/messages")
def add_message(message: Message):
    global current_buffer

    current_msg = current_buffer["message"]

    # SAME SPEAKER + SAME CALL
    if (
        current_buffer["call_id"] == message.call_id and
        current_buffer["role"] == message.role and
        current_msg is not None
    ):
        existing = current_msg.transcript.strip()
        incoming = message.transcript.strip()
        # Compute similarity
        similarity = SequenceMatcher(None, existing, incoming).ratio()

        if (similarity > 0.6 and len(incoming) >= len(existing)) or incoming.startswith(existing) and len(incoming) > len(existing):
            # Update buffer with longer version
            current_buffer["message"] = message
            return {"message": "Transcript updated with longer version."}

        elif (similarity > 0.6 and len(incoming) < len(existing)) or existing.startswith(incoming):
            # Shorter or partial repeat → ignore
            return {"message": "Ignored shorter/duplicate message."}

        else:
            # Diverging message (different content) → flush buffer
            memory_db["messages"].append(current_msg)
            calls[message.call_id].messages.append(current_msg)  # Add to the correct call
            current_buffer = {
                "call_id": message.call_id,
                "role": message.role,
                "message": message
            }
            return {"message": "Flushed previous. New diverging message buffered."}

    # SPEAKER CHANGED → flush buffer if exists
    if current_msg is not None:
        memory_db["messages"].append(current_msg)
        calls[message.call_id].messages.append(current_msg)  # Add to the correct call

    # Start new buffer
    current_buffer = {
        "call_id": message.call_id,
        "role": message.role,
        "message": message
    }

    # Store the call in the calls dictionary if it's a new call_id
    if message.call_id not in calls:
        calls[message.call_id] = Call(call_id=message.call_id, phone_number=message.phone_number)

    return {"message": "New speaker. Message buffered."}


@app.get("/api/calls")
def get_call_ids():
    return {
        "calls": [{"call_id": call.call_id, "phone_number": call.phone_number} for call in calls.values()]
    }

@app.delete("/api/clear_calls_messages")
def clear_calls():
    global memory_db
    global calls

    memory_db: Dict[str, List[Message]] = {"messages": []}
    calls: Dict[str, Call] = {}

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