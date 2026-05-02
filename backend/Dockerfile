# -------------------------
# STAGE 1: Build Frontend
# -------------------------
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend config and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy the remaining React code and compile it with Vite
COPY frontend/ ./
RUN npm run build


# -------------------------
# STAGE 2: Build Backend & Serve
# -------------------------
FROM node:18-alpine
WORKDIR /app

# Copy backend package files and install ALL dependencies
# (Prisma needs to be installed to run generate)
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the core backend application logic
COPY server.js ./
COPY src ./src

# Pull the static files built in Stage 1 and place them in /public
COPY --from=frontend-builder /app/frontend/dist ./public

# Railway injects the PORT environment variable dynamically
EXPOSE ${PORT:-5000}

# Spin up the Node server
CMD ["node", "server.js"]
