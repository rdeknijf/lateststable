from fastapi import APIRouter, Response, status

from lst import lst, Result

router = APIRouter()


@router.get('/pypi/{package}', response_model=Result)
async def get_pypi(package: str, response: Response):

    ret = lst.pypi(package)
    if not ret:
        response.status_code = status.HTTP_404_NOT_FOUND
    return ret


@router.get('/jetbrains/{package}', response_model=Result)
async def get_jetbrains(package: str, response: Response):

    ret = lst.jetbrains(package)
    if not ret:
        response.status_code = status.HTTP_404_NOT_FOUND
    return ret


@router.get('/docker/{user}/{image}', response_model=Result)
async def get_docker(user: str, image: str):
    return lst.docker(f'{user}/{image}')


@router.get('/github/{user}/{repo}', response_model=Result)
async def get_github(user: str, repo: str):
    return lst.github(f'{user}/{repo}')


@router.get('/wikipedia/{package}', response_model=Result)
async def get_wikipedia(package: str):
    return lst.wikipedia(package)


@router.get('/npm/{package}', response_model=Result)
async def get_npm(package: str):
    return lst.npm(package)


@router.get('/helm/{repo}/{chart}', response_model=Result)
async def get_helm(repo: str, chart: str):
    return lst.helm(repo, chart)
