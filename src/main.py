import uvicorn
from fastapi import FastAPI

from routers import router

app = FastAPI()

app.include_router(router, prefix='/v1')

# for debugging
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8080)
