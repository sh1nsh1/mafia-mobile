# from api.v1 import *_router
from fastapi import FastAPI
# from ws import WSManager
from api.v1.routers.lobby_router import lobby_router
import uvicorn
from dotenv import load_dotenv

print(load_dotenv())

app = FastAPI()
app.include_router(lobby_router)

if __name__ == "__main__":
    uvicorn.run(
        app="main:app",
        host="127.0.0.1",
        port=8000,
    )
