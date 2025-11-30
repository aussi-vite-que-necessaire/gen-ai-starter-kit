# Gen AI Starter Kit

Starter kit pour apps Gen AI avec **n8n** pour la logique métier et une **API lean** pour l'auth/DB.

## 🏗 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │────▶│     n8n     │
│   (React)   │     │   (Hono)    │     │ (Workflows) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    │
                    ┌─────────────┐             │
                    │  PostgreSQL │◀────────────┘
                    │    Redis    │   (callbacks)
                    └─────────────┘
```

- **API** : Auth (Better-Auth), DB (Drizzle), lance les workflows via BullMQ
- **n8n** : Toute la logique métier, appelle l'API pour sauvegarder les résultats
- **Custom Nodes** : Générés automatiquement depuis les schemas partagés

## 🚀 Quick Start

```bash
# 1. Lancer l'infra (DB, Redis, n8n)
npm run docker:up

# 2. Installer les dépendances
npm install

# 3. Migrations DB
npm run db:migrate -w api

# 4. Lancer API + Frontend
npm run dev
```

**URLs locales :**

- Frontend : http://localhost:5173
- API : http://localhost:3000
- n8n : http://localhost:5678

## 📁 Structure

```
apps/
├── api/          # API Hono (auth, DB, workflows)
├── web/          # Frontend React + Vite
└── automation/
    ├── custom-node/    # Nodes n8n auto-générés
    └── workflows/      # Export JSON des workflows

packages/
└── shared/       # Types partagés (Zod schemas)
```

## 🔄 Workflows

Les workflows sont définis dans `packages/shared/src/workflows/`:

```typescript
// Définir un nouveau workflow
export const pageGenerationPayload = z.object({ prompt: z.string() })
export const pageGenerationResult = z.object({
  title: z.string(),
  content: z.string(),
})
```

Les custom nodes n8n sont **auto-générés** :

```bash
npm run generate:nodes -w custom-node
```

## 🔧 Développement n8n

Les workflows sont **auto-exportés** avant chaque commit (via Husky) :

- Modifie ton workflow dans n8n local
- `git commit` → export automatique
- Les JSONs sont versionnés dans `apps/automation/workflows/`

## 🚢 Déploiement

- **Push sur `main`** → Deploy en production
- **Pull Request** → Environnement preview isolé (auto-détruit à la fermeture)

GitHub Actions gère :

- Build des images Docker
- Import des workflows n8n
- Activation + restart pour les webhooks

## 📝 Commandes utiles

```bash
npm run dev              # API + Frontend
npm run docker:up        # Infra locale
npm run db:migrate -w api    # Migrations
npm run n8n:export       # Export manuel workflows
npm run generate:nodes -w custom-node  # Rebuild nodes
```

v2
