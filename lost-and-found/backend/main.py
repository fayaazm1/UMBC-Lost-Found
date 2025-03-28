from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from database import engine, Base
from routes.post_routes import router as post_router
from routes.notification_routes import router as notification_router
from routes.user_routes import router as user_router
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from fastapi.middleware.trustedhost import TrustedHostMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomCORSMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Log the incoming request details
        origin = request.headers.get('origin')
        logger.info(f"Incoming request from origin: {origin}")
        logger.info(f"Request headers: {dict(request.headers)}")

        # Handle preflight requests
        if request.method == "OPTIONS":
            return JSONResponse(
                content={},
                headers=self._get_cors_headers(),
            )

        # Get response from endpoint
        response = await call_next(request)

        # Add CORS headers to response
        headers = self._get_cors_headers()
        response.headers.update(headers)

        # Log the response headers
        logger.info(f"Final response headers: {dict(response.headers)}")
        return response

    def _get_cors_headers(self):
        return {
            "Access-Control-Allow-Origin": "https://umbc-lost-found.vercel.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Max-Age": "3600",
            "Access-Control-Expose-Headers": "*",
            "Vary": "Origin",
            # Ensure Cloudflare doesn't cache the CORS headers
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }

app = FastAPI()

@app.middleware("http")
async def log_headers(request: Request, call_next):
    logger.info(f"Request headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"Response headers: {dict(response.headers)}")
    return response

# Add custom CORS middleware first
app.add_middleware(CustomCORSMiddleware)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
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
