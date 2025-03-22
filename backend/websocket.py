from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect
from database import messages_collection
from models import Message
import json

app = FastAPI()

active_connections = []

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    active_connections.append((user_id, websocket))
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            messages_collection.insert_one(message)  # Save to MongoDB
            
            # Send the message to the intended recipient
            for uid, conn in active_connections:
                if uid == message["receiver_id"]:
                    await conn.send_text(json.dumps(message))
    except WebSocketDisconnect:
        active_connections.remove((user_id, websocket))
