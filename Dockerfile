# ==============================================================================
# Multi-Stage Dockerfile for TOTC LMS React 19 Frontend
# Multi-stage: Node 22 build -> Nginx Alpine production server
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and build config
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Hardened Nginx Runtime
FROM nginx:alpine AS final

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built static SPA assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom reverse proxy and security configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
