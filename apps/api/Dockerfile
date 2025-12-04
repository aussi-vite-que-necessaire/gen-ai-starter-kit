# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install dependencies (CI=true skips Husky)
ENV CI=true
RUN npm install

# Copy source and build with tsup
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.base.json ./
RUN npm run build --workspace=@genai/shared
RUN npm run build --workspace=api

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node

# Copy only what we need for runtime
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=node:node /app/packages/shared/package.json ./packages/shared/
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/index.js"]
