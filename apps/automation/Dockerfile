FROM n8nio/n8n:latest

USER root

# --- 1. COPIE DU CODE PARTAGÉ (Shared) ---
# Le script a besoin de lire /home/node/packages/shared/src/workflows/index.ts
# On recrée donc cette structure de dossiers dans l'image
WORKDIR /home/node/packages/shared
COPY packages/shared .

# --- 2. SETUP DU CUSTOM NODE ---
WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

# Installation des dépendances
COPY apps/automation/custom-node/package*.json ./

# On force le mode development pour avoir tsx
RUN NODE_ENV=development npm ci

# Copie du code source du custom node
COPY apps/automation/custom-node .

# --- 3. BUILD ---
# Maintenant que 'packages/shared' est présent dans l'image, le script va le trouver !
RUN npm run build

# Nettoyage
RUN npm prune --production

# Retour à l'utilisateur standard
USER node
WORKDIR /home/node