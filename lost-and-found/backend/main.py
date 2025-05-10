import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, post_routes, message_routes, notification_routes, admin_routes
from routes import claim_routes_file as claim_routes
from app import claim_routes as app_claim_routes
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
        "http://localhost:5173",                   # local development
        "http://127.0.0.1:5173",                   # alternative local development URL
        "http://127.0.0.1:52220",                  # browser preview proxy
        "*"                                        # allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],                         # Expose all headers
    max_age=86400                                # Cache preflight requests for 24 hours
)

# Include routers
app.include_router(user_routes.router, prefix="/api")
app.include_router(post_routes.router, prefix="/api")
app.include_router(message_routes.router, prefix="/api")
app.include_router(notification_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(claim_routes.router, prefix="/api")
app.include_router(app_claim_routes.router)

@app.on_event("startup")
async def startup_event():
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Could not connect to MongoDB: {e}")
        raise e

if __name__ == "__main__":
    # Get port from environment variable for Render compatibility
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
