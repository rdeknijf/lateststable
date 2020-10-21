from fastapi import APIRouter, Response, status

from lst import lst

router = APIRouter()


@router.get('/pypi/{package}')
async def get_pypi(package: str, response: Response):

    ret = lst.pypi(package)
    if not ret:
        response.status_code = status.HTTP_404_NOT_FOUND
    return ret


@router.get('/jetbrains/{package}')
async def get_jetbrains(package: str, response: Response):

    ret = lst.jetbrains(package)
    if not ret:
        response.status_code = status.HTTP_404_NOT_FOUND
    return ret


@router.get('/docker/{user}/{image}')
async def get_docker(user: str, image: str):
    return lst.docker(f'{user}/{image}')


@router.get('/github/{user}/{repo}')
async def get_github(user: str, repo: str):
    return lst.github(f'{user}/{repo}')


@router.get('/wikipedia/{package}')
async def get_wikipedia(package: str):
    return await lst.wikipedia(package)
