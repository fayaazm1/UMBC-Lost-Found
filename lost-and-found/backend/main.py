from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
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

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    logger.info(f"Request origin: {request.headers.get('origin')}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = "https://umbc-lost-found.vercel.app"
    
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "3600"
    response.headers["Vary"] = "Origin"
    
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    origin = request.headers.get("origin")
    if origin in origins:
        headers = {"Access-Control-Allow-Origin": origin}
    else:
        headers = {"Access-Control-Allow-Origin": "https://umbc-lost-found.vercel.app"}
    
    headers.update({
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "3600",
        "Vary": "Origin",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    })
    
    return Response(status_code=200, headers=headers)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(post_router)
app.include_router(notification_router)
app.include_router(user_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lost & Found API"}
