from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List
from routes import router  # Import routes.py
from fastapi import WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# Include the API routes from routes.py
app.include_router(router)


# Define Message Schema
class Message(BaseModel):
    sender_id: str
    receiver_id: str
    message: str

# Mock Database (Replace with real DB logic)
messages = []

# ✅ **CREATE (POST) - Send a Message**
@app.post("/send_message/", response_model=dict)
async def send_message(msg: Message):
    try:
        new_message = {
            "id": len(messages) + 1,  # Mock ID (Replace with DB auto-increment ID)
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "message": msg.message,
            "timestamp": datetime.utcnow()
        }
        messages.append(new_message)
        return {"status": "success", "message": "Message sent successfully!", "data": new_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # 🚨 Add this block below your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ✅ React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ **READ (GET) - Get All Messages**
@app.get("/messages/", response_model=List[dict])
async def get_all_messages():
    return messages

# ✅ **READ (GET) - Get a Single Message by ID**
@app.get("/messages/{message_id}", response_model=dict)
async def get_message_by_id(message_id: int):
    for msg in messages:
        if msg["id"] == message_id:
            return msg
    raise HTTPException(status_code=404, detail="Message not found")

# ✅ **UPDATE (PUT) - Update a Message**
@app.put("/messages/{message_id}", response_model=dict)
async def update_message(message_id: int, updated_message: Message):
    for msg in messages:
        if msg["id"] == message_id:
            msg["message"] = updated_message.message
            msg["timestamp"] = datetime.utcnow()
            return {"status": "success", "message": "Message updated successfully!", "data": msg}
    raise HTTPException(status_code=404, detail="Message not found")

# ✅ **DELETE (DELETE) - Delete a Message**
@app.delete("/messages/{message_id}", response_model=dict)
async def delete_message(message_id: int):
    for msg in messages:
        if msg["id"] == message_id:
            messages.remove(msg)
            return {"status": "success", "message": "Message deleted successfully!"}
    raise HTTPException(status_code=404, detail="Message not found")



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📩 Received from client: {data}")
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        print(f"❌ WebSocket disconnected: {e}")



@app.get("/")
def read_root():
    return {"message": "FastAPI server is running!"}
