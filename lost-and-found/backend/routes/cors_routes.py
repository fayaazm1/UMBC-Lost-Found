from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

@router.options("/{full_path:path}")
async def options_handler(full_path: str):
    return JSONResponse(
        content={"message": "CORS preflight handled"},
        headers={
            "Access-Control-Allow-Origin": "https://umbc-lost-found.vercel.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )
