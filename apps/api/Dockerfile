FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Génération SQL (si besoin au build)
RUN npx drizzle-kit generate

EXPOSE 3000

# On utilise tsx pour lancer le code TS directement en prod (performant sur Node 22)
# Ou tu peux compiler en JS si tu préfères, mais tsx est très stable.
CMD ["npm", "run", "start"]