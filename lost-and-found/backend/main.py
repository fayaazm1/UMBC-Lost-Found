from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, post_routes, message_routes, notification_routes, admin_routes
from config.db import engine, Base
from models.user import User
from models.post import Post
from config.mongodb import client

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://umbc-lost-found-1.onrender.com",  # frontend domain
        "http://localhost:5173"                    # local development (optional)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_routes.router, prefix="/api")
app.include_router(post_routes.router, prefix="/api")
app.include_router(message_routes.router, prefix="/api")
app.include_router(notification_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Could not connect to MongoDB: {e}")
        raise e

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
