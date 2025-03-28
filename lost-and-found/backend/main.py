from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
origins = [
    "https://umbc-lost-found.vercel.app",
    "https://umbc-lost-found-git-main-fayaazs-projects-2ea58c4f.vercel.app",
    "http://localhost:5173"
]

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.middleware("http")
async def log_middleware(request: Request, call_next):
    logger.info(f"Request path: {request.url.path}")
    logger.info(f"Request origin: {request.headers.get('origin')}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers with prefix
app.include_router(post_router)
app.include_router(notification_router)
app.include_router(user_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Lost & Found API"}

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Path {request.url.path} not found"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", origins[0]),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )
