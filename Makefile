SSH_HOST = avqn-prod
REMOTE_DIR = ~/apps/proof-of-project

ssh:
	ssh $(SSH_HOST)

logs:
	ssh $(SSH_HOST) "cd $(REMOTE_DIR) && docker compose logs -f"

backup:
	ssh $(SSH_HOST) "cd $(REMOTE_DIR) && docker compose exec db-backup /backup.sh"

reset-db:
	ssh $(SSH_HOST) "cd $(REMOTE_DIR) && docker compose down -v && docker compose up -d"

console:
	ssh $(SSH_HOST) "cd $(REMOTE_DIR) && docker compose exec app sh"

migrate:
	ssh $(SSH_HOST) "cd $(REMOTE_DIR) && docker compose exec app npm run db:migrate"