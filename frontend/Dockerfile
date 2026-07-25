# ---- Stage 1: Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install ALL dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Vite project
RUN npm run build

# ---- Stage 2: Production (nginx) ----
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*.default

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
