pipenv lock --requirements > requirements.txt
docker build -t eu.gcr.io/orca-205614/lst:latest .
docker push eu.gcr.io/orca-205614/lst:latest
gcloud run deploy lst --image eu.gcr.io/orca-205614/lst:latest --platform managed --allow-unauthenticated --region=europe-west1