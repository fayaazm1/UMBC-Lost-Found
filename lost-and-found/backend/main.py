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
        "http://localhost:5173",  # Local dev
        "https://umbc-lost-found.vercel.app",  # Vercel production
        "https://umbc-lost-found-git-main-fayaazs-projects-2ea58c4f.vercel.app",  # Vercel preview
        "https://umbc-lost-found.onrender.com",  # Old deploy (optional)
        "https://lost-and-found-frontend.onrender.com",  # Old deploy (optional)
        "http://localhost:3000",  # Local dev alternative port
        "http://127.0.0.1:5173",  # Local dev alternative host
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
