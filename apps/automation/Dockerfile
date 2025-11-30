FROM n8nio/n8n:latest

USER root

# Préparation du dossier custom nodes
WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

# 1. Installation des dépendances (package.json doit exister dans ton dossier source)
COPY apps/automation/custom-node/package*.json ./
RUN npm ci --omit=dev

# 2. Copie du code source et build
COPY apps/automation/custom-node .
RUN npm run build

# Retour à l'utilisateur sécurisé
USER node
WORKDIR /home/node