# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/
ENV CI=true
RUN npm install
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN npm run build --workspaces --if-present

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/index.js"]
