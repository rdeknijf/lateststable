from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from routers import router

app = FastAPI()

app.include_router(router, prefix='/v1')


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def homepage():
    with open(Path(Path(__file__).parent, 'homepage.html'), 'r') as f:
        return f.read()

# for debugging
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8080)
