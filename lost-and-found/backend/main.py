from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://umbc-lost-found.onrender.com",  # Production frontend URL
        "https://lost-and-found-frontend.onrender.com"  # Alternative production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(post_router)
app.include_router(notification_router)
app.include_router(user_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lost & Found API"}
