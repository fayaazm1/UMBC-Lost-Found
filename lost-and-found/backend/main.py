from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router
from fastapi.middleware.cors import CORSMiddleware

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://umbc-lost-found.vercel.app",
        "https://umbc-lost-found.onrender.com",
        "https://umbc-lost-found-1.onrender.com",  # ✅ <-- Add this line
        "https://lost-and-found-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.middleware("http")
async def log_middleware(request: Request, call_next):
    logger.info(f"{'='*50}")
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    logger.info(f"Request origin: {request.headers.get('origin')}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Response headers: {dict(response.headers)}")
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
    allowed_origins = [
        "https://umbc-lost-found.vercel.app",
        "https://umbc-lost-found-git-main-fayaazs-projects-2ea58c4f.vercel.app",
        "http://localhost:5173"
    ]
    allowed_origin = origin if origin in allowed_origins else allowed_origins[0]
    
    return JSONResponse(
        status_code=404,
        content={"detail": f"Path {request.url.path} not found"},
        headers={
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )
