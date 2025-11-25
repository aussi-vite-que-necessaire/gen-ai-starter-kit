# Étape 1 : Build
FROM node:22-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Important : les variables d'environnement de build (VITE_...) doivent être passées ici si besoin
# Pour l'instant on build en "générique"
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie de la config Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copie des fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]