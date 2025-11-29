FROM node:22-alpine
WORKDIR /app

# 1. Copie SEULEMENT les package.json (pour cache layer)
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# 2. Install (cache si package.json ne change pas)
RUN npm install --workspace=@genai/shared --workspace=api --ignore-scripts

# 3. Copie le code (invalide seulement si code change)
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["npm", "run", "start"]
