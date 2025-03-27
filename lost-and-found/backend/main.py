from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import models
from backend.models import Post, User

from backend.database import engine
from backend.routes.post_routes import router as post_router


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Lost & Found API!"}


app.include_router(post_router)


models.Base.metadata.create_all(bind=engine)
