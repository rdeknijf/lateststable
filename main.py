import uvicorn
from fastapi import FastAPI

from lst import lst

app = FastAPI()


@app.get('/pypi/{package}')
async def get_pypi(package: str):
    return {'version': await lst.pypi(package)}


@app.get('/docker/{user}/{image}')
async def get_docker(user: str, image: str):
    return {'version': await lst.docker(f'{user}/{image}')}


@app.get('/github/{user}/{repo}')
async def get_github(user: str, repo: str):
    return {'version': await lst.github(f'{user}/{repo}')}


@app.get('/wikipedia/{package}')
async def get_wikipedia(package: str):
    return {'version': await lst.wikipedia(package)}

# for debugging
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
