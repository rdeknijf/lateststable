FROM python:3.8-slim as run

# turn off pip caching for pip and pipenv
ENV PIP_NO_CACHE_DIR=off
ENV PIPENV_VENV_IN_PROJECT=1
ENV PYTHONPATH /app

WORKDIR /app

RUN pip3 install pipenv
ADD Pipfil* /app/

RUN pipenv install --ignore-pipfile

# activate the pipenv venv
ENV PATH="/app/.venv/bin:$PATH"

ADD *.py /app/

CMD uvicorn main:app --host 0.0.0.0 --port 8000


#ENTRYPOINT ["python", "/app/main.py"]
#
#FROM run as test
#
#RUN pipenv install --system --deploy --ignore-pipfile --dev -v
#
#ADD /tests/*.py /app/tests/
#ADD /tox.ini /app/
#
#ENTRYPOINT []