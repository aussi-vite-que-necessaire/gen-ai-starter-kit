FROM n8nio/n8n:latest

USER root

# Préparation du dossier custom nodes
WORKDIR /home/node/.n8n/custom/n8n-nodes-genai-app

# 1. Copie des fichiers de dépendances
COPY apps/automation/custom-node/package*.json ./

# 2. Installation de TOUTES les dépendances (y compris tsx et typescript)
# On enlève le "--omit=dev" ici car on a besoin de builder
RUN npm ci

# 3. Copie du code source
COPY apps/automation/custom-node .

# 4. Build (Maintenant tsx est disponible, ça va marcher)
RUN npm run build

# 5. Nettoyage : On supprime les outils de dev (tsx, typescript...) pour alléger l'image
RUN npm prune --production

# Retour à l'utilisateur sécurisé
USER node
WORKDIR /home/node