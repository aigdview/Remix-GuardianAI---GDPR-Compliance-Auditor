# ==============================================================================
# STAGE 1: Build React Frontend Assets
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==============================================================================
# STAGE 2: Python ADK Agent & FastAPI Production Runtime
# ==============================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY agent.py main.py ./

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create non-root app user
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

# Cloud Run dynamic port binding
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
