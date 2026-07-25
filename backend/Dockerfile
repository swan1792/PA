# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /build

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

RUN mkdir -p /app/data

COPY --from=build /build/dist ./dist
COPY --from=build /build/package.json ./
COPY --from=build /build/node_modules ./node_modules

EXPOSE ${PORT:-3001}

CMD ["node", "dist/index.js"]
