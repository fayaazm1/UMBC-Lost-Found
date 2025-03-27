from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState
from routes import router  # ✅ Using only /api routes

app = FastAPI()

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include only /api router
app.include_router(router, prefix="/api")

# ✅ WebSocket Endpoint for real-time messaging
@app.websocket("/ws/{sender_id}_{receiver_id}")
async def websocket_endpoint(websocket: WebSocket, sender_id: str, receiver_id: str):
    await websocket.accept()
    print(f"🟢 WebSocket connected: {sender_id} -> {receiver_id}")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 Message from {sender_id} to {receiver_id}: {data}")
            await websocket.send_text(f"{sender_id}: {data}")
    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: {sender_id} -> {receiver_id}")
    finally:
        if websocket.application_state != WebSocketState.DISCONNECTED:
            await websocket.close()
        print(f"🔴 WebSocket closed: {sender_id} -> {receiver_id}")

# Dummy route to prevent 404 from React
@app.get("/lost")
def get_lost_items():
    return {"message": "This is the /lost endpoint!"}

# Root test route
@app.get("/")
def root():
    return {"message": "FastAPI server is running!"}
