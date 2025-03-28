from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router
from routes.cors_routes import router as cors_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.middleware("http")
async def log_headers(request: Request, call_next):
    logger.info(f"Request headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    logger.info(f"Incoming request from origin: {request.headers.get('origin')}")
    
    # Get the response from the endpoint
    response = await call_next(request)
    
    # Set CORS headers manually
    headers = {
        "Access-Control-Allow-Origin": "https://umbc-lost-found.vercel.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "3600",
    }
    
    # Add headers to response
    response.headers.update(headers)
    
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

@app.options("/{full_path:path}")
async def options_handler(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "https://umbc-lost-found.vercel.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(cors_router)  
app.include_router(post_router)
app.include_router(notification_router)
app.include_router(user_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lost & Found API"}
