# ===========================
# Dockerfile.api (LOCAL)
# ===========================

FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Copy dependencies
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy full source
COPY . .

# Environment
ENV NODE_ENV=development

EXPOSE 8080

# Start app
CMD ["npm", "run", "start"]
