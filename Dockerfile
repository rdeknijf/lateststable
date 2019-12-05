FROM python:3.8-slim

WORKDIR /app

RUN pip install gunicorn

COPY requirements.txt .

RUN pip install -r requirements.txt -U

COPY . .

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 app:app