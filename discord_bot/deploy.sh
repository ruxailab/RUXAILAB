#!/bin/bash
# Simple deployment script for Discord bot to Cloud Run

# Set your Google Cloud project ID
PROJECT_ID="finaltest-b0895"
REGION="us-central1"
SERVICE_NAME="discord-bot"

# Enable required services
echo "Enabling required services..."
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com

# Set default project
echo "Setting default project to $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Build the Docker image
echo "Building Docker image..."
docker buildx build --platform linux/amd64 \
  -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  -f Dockerfile \
  --push \
  .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform=managed \
  --region=$REGION \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=1 \
  --concurrency=80 \
  --timeout=300s \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --execution-environment=gen2

echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="value(status.url)")

echo "Service URL: $SERVICE_URL" 