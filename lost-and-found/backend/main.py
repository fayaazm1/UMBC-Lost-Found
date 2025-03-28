from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
default_origins = [
    "https://umbc-lost-found.vercel.app",
    "https://umbc-lost-found-git-main-fayaazs-projects-2ea58c4f.vercel.app",
    "http://localhost:5173"
]

# Get origins from environment variable if available
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not origins or not origins[0]:  # If env var is not set or empty
    origins = default_origins

logger.info("Configured CORS origins:")
for origin in origins:
    logger.info(f"- {origin}")

# Debug: Print environment variables
logger.info("Environment variables:")
for key, value in os.environ.items():
    if any(term in key.lower() for term in ['cors', 'origin', 'allow', 'frontend']):
        logger.info(f"{key}: {value}")

# Add CORS middleware with explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=None,  # Disable regex matching
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

@app.middleware("http")
async def log_middleware(request: Request, call_next):
    # Log request details
    logger.info(f"{'='*50}")
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    logger.info(f"Request origin: {request.headers.get('origin')}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    # Log response details
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Response headers: {dict(response.headers)}")
    
    # Ensure CORS headers are set correctly
    origin = request.headers.get("origin")
    if origin and origin in origins:
        actual_origin = response.headers.get("access-control-allow-origin")
        if actual_origin != origin:
            logger.error(f"CORS header mismatch! Expected: {origin}, Got: {actual_origin}")
            # Force the correct origin
            response.headers["access-control-allow-origin"] = origin
    
    logger.info(f"{'='*50}")
    return response

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {str(e)}")
    raise

# Include routers with prefix
logger.info("Registering routes...")
app.include_router(post_router)
app.include_router(notification_router)
app.include_router(user_router)
logger.info("Routes registered successfully")

# Print all registered routes for debugging
for route in app.routes:
    logger.info(f"Registered route: {route.path} [{','.join(route.methods)}]")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Lost & Found API"}

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    logger.warning(f"404 Not Found: {request.url.path}")
    origin = request.headers.get("origin")
    allowed_origin = origin if origin in origins else origins[0]
    
    return JSONResponse(
        status_code=404,
        content={"detail": f"Path {request.url.path} not found"},
        headers={
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
        }
    )
