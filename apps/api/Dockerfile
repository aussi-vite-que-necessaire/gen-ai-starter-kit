FROM node:22-alpine
WORKDIR /app

# Copie des fichiers de config monorepo
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/

# Copie du code shared
COPY packages/shared ./packages/shared

# Copie du code api
COPY apps/api/package*.json ./apps/api/
COPY apps/api ./apps/api

# Install depuis la racine (gère les workspaces)
RUN npm install --workspace=@genai/shared --workspace=api

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["npm", "run", "start"]
