# Étape 1 : Build (depuis la racine du monorepo)
FROM node:22-alpine AS builder
WORKDIR /app

# 1. Copie SEULEMENT les package.json (pour cache layer)
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

# 2. Install (cache si package.json ne change pas)
RUN npm install --workspace=@genai/shared --workspace=web --ignore-scripts

# 3. Copie le code (invalide seulement si code change)
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build le shared puis le web
WORKDIR /app/apps/web
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
