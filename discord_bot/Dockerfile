FROM --platform=linux/amd64 python:3.13-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY discord_bot_requirements.txt .
RUN pip install --no-cache-dir -r discord_bot_requirements.txt

# Copy all bot files
COPY . .

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Expose port for health check
EXPOSE 8080

# Run the entrypoint script
CMD ["/app/entrypoint.sh"] 