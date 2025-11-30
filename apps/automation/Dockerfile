FROM n8nio/n8n:latest

USER root

WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

COPY apps/automation/custom-node/package*.json ./

# 🔥 FIX : On force le mode development pour que npm installe BIEN les devDependencies
# L'image n8n a NODE_ENV=production par défaut, ce qui empêchait l'installation de tsx malgré tout.
RUN NODE_ENV=development npm ci

COPY apps/automation/custom-node .

# Maintenant tsx sera là
RUN npm run build

# Nettoyage : On repasse en mode prod et on supprime les outils de dev
RUN npm prune --production

USER node
WORKDIR /home/node