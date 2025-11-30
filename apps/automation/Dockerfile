FROM n8nio/n8n:latest

USER root

# --- 1. CODE PARTAGÉ ---
WORKDIR /home/node/packages/shared
COPY packages/shared .

# --- 2. SETUP CUSTOM NODE ---
WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

# Installation dépendances
COPY apps/automation/custom-node/package*.json ./
RUN NODE_ENV=development npm ci

# 👇 FIX : On installe explicitement les types Node pour que TypeScript arrête de se plaindre
RUN npm install --save-dev @types/node

# Copie du code
COPY apps/automation/custom-node .

# --- 3. BUILD ---
RUN npm run build

# Nettoyage
RUN npm prune --production

USER node
WORKDIR /home/node