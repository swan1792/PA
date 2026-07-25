# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# ---- Stage 2: Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# ---- Stage 3: Production ----
FROM node:20-alpine AS production
WORKDIR /app

# Create data directory for SQLite (volume mount point)
RUN mkdir -p /app/data

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=build /app/dist ./dist

# Default environment variables
ENV PORT=3001
ENV DATABASE_URL=file:./data/app.db

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]
