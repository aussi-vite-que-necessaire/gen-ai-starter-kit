# Étape 1 : Arrêter le projet et tuer les conteneurs

cd ~/apps/gen-ai-starter-kit
docker compose down --volumes --remove-orphans

# Étape 2 : Supprimer les Bases de Données (CRITIQUE) ⚠️

docker stop $(docker ps -q --filter name=gen-ai-starter-kit) 2>/dev/null

docker exec -it postgres-central dropdb -U admin_postgres gen-ai-starter-kit_app

docker exec -it postgres-central dropdb -U admin_postgres gen-ai-starter-kit_n8n

# Étape 3 : Supprimer les fichiers

cd ~
rm -rf ~/apps/gen-ai-starter-kit

# Étape 4 : Le Grand Ménage (Libérer l'espace) 🧹

docker system prune -a --volumes -f
