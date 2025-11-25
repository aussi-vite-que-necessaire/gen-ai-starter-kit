# Gen AI App - Starter Kit

Stack de production complète avec CI/CD, environnements de preview (PR) et monitoring.

## 🔗 Accès Rapides

| Service              | URL                                       |
| :------------------- | :---------------------------------------- |
| **Production**       | `https://proof-of-project.avqn.ch`        |
| **Emails (Mailpit)** | `https://emails.proof-of-project.avqn.ch` |
| **DB (Adminer)**     | `https://studio.proof-of-project.avqn.ch` |
| **Status**           | `https://status.proof-of-project.avqn.ch` |

## 🛠 Stack Technique

- **App :** Node.js 22, Drizzle ORM, Postgres 15, Redis 7.
- **Ops :** Docker Compose, Traefik (Reverse Proxy + SSL auto), GitHub Actions.
- **Tools :** Mailpit (SMTP Mock), Adminer (GUI Base de données), Uptime Kuma (Monitoring).

## 💻 Développement Local

**1. Démarrer l'infrastructure (DB + Redis)**

```bash
npm run dev:db:up
```

_Port Postgres local : `5433` (pour éviter les conflits)_

**2. Setup de l'environnement**

```bash
export DATABASE_URL="postgresql://app_user:dev_password@localhost:5433/mydb"
npm install
npm run db:migrate
```

**3. Lancer l'app**

```bash
npm start
```

## 🔄 CI/CD & Déploiement

Le workflow est entièrement automatisé via GitHub Actions.

> **Note :** Les environnements de preview sont créés automatiquement pour chaque PR.

- **Branche `main`** : Déploiement automatique en production.
- **Pull Requests** : Création d'un environnement éphémère (`https://pr-X.proof-of-project...`) avec sa propre DB isolée. Suppression automatique à la fermeture de la PR.

### Secrets Requis (GitHub)

- `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` : Accès SSH au serveur.
- `DB_PASSWORD` : Mot de passe de production.

## 🗄 Base de données

Gestion du schéma via Drizzle Kit.

```bash
# Générer la migration après modif du schema.js
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

## ⚙️ Commandes Ops (Makefile)

Commandes raccourcies pour gérer le serveur via SSH (nécessite d'avoir configuré `~/.ssh/config`).

```bash
make ssh        # Connexion au VPS
make logs       # Logs en temps réel de tous les services
make backup     # Forcer un backup DB immédiat
make console    # Shell dans le conteneur App
```

**Backups :** Automatiques (quotidiens), stockés dans `./backups/` sur le VPS. Rétention : 7 jours, 4 semaines, 6 mois.

## Architecture

apps/api/src/
├── core/ # 🧠 LE CERVEAU (Domain & Use Cases)
│ ├── entities/ # Types Zod & TypeScript (ex: User, AISummary)
│ ├── ports/ # Interfaces abstraites (ex: AIProvider, DatabaseRepository)
│ ├── errors/ # Erreurs métier (ex: QuotaExceededError)
│ └── use-cases/ # La logique pure (ex: generate-summary.ts)
│ └── **tests**/ # Tests Unitaires (Rapides)
│
├── infra/ # 🔌 LES CÂBLES (Implémentations)
│ ├── adapters/ # Implémentation des Ports (ex: OpenAIAdapter, PostgresAdapter)
│ ├── db/ # Configuration Drizzle, Schema, Migrations
│ └── env.ts # Validation Zod des variables d'env
│
└── interface/ # 🗣️ LA BOUCHE (Points d'entrée)
├── http/ # Serveur Hono, Routes, Middlewares
│ └── **tests**/ # Tests E2E (Appels HTTP réels sur DB de test)
└── workers/ # Workers BullMQ (Async jobs)
