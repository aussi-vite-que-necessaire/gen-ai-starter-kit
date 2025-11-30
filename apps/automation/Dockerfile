FROM n8nio/n8n:latest

USER root

# --- 1. CODE PARTAGÉ ---
WORKDIR /home/node/packages/shared
COPY packages/shared .

# --- 2. SETUP CUSTOM NODE ---
WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

COPY apps/automation/custom-node/package*.json ./

# 👇 FIX IMPORTANT : On force le mode DEV pour tout le bloc suivant
# Cela empêche NPM de supprimer 'tsx' entre deux commandes
ENV NODE_ENV=development

# Installation propre + ajout du fix TypeScript
RUN npm ci
RUN npm install --save-dev @types/node

# Copie du code
COPY apps/automation/custom-node .

# Build (tsx est garanti d'être là)
RUN npm run build

# --- 3. NETTOYAGE ---
# 👇 On repasse officiellement en PROD
ENV NODE_ENV=production

# On supprime tout ce qui ne sert plus (tsx, typescript, @types/node...)
RUN npm prune --production

USER node
WORKDIR /home/node