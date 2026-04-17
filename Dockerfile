# Backend Dockerfile
# Build: docker build -t plant-disease-api .
# Run:   docker run -p 5000:5000 plant-disease-api

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxrender1 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy model files
COPY model/model.h5 ./model/model.h5
COPY model/class_names.json ./model/class_names.json

# Copy disease knowledge base
COPY data/disease_info.json ./data/disease_info.json

WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run with gunicorn
CMD ["gunicorn", "app:app", \
     "--workers", "2", \
     "--timeout", "120", \
     "--bind", "0.0.0.0:5000", \
     "--log-level", "info"]
