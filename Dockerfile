# Use your specific Node version
FROM node:20.19.5-slim

# Install system dependencies for Puppeteer, ffmpeg, sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxss1 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer will look for Chromium here
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Create a non-root user
RUN useradd -m appuser
USER appuser

# Start your bot
CMD ["npm", "start"]
