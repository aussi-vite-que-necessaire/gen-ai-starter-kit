# Étape 1 : Build (depuis la racine du monorepo)
FROM node:22-alpine AS builder
WORKDIR /app

# Copie des fichiers de config monorepo
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/

# Copie du code shared
COPY packages/shared ./packages/shared

# Copie du code web
COPY apps/web/package*.json ./apps/web/
COPY apps/web ./apps/web

# Install depuis la racine (gère les workspaces)
RUN npm install --workspace=@genai/shared --workspace=web

# Build le shared puis le web
WORKDIR /app/apps/web
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
