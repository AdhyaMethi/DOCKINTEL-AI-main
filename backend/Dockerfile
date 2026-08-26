FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OCR and PDF parsing
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source code
COPY . .

# Ensure storage directories
RUN mkdir -p storage/uploads storage/processed

EXPOSE 5000

CMD ["python", "run.py"]
