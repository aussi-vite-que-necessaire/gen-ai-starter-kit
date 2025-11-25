C'est la meilleure chose à faire. Avec ce document, tu pourras ouvrir une nouvelle session avec Claude, ChatGPT ou Cursor dans 3 mois, copier-coller ce bloc, et l'IA saura **exactement** comment coder, quelle architecture respecter et quelle est la philosophie du projet.

Voici le **Master Context V3**. Sauvegarde-le dans un fichier `PROJECT_CONTEXT.md` à la racine de ton projet.

---

# 📘 GEN AI STARTER KIT - MASTER CONTEXT (V3)

Ce document décrit l'état technique, l'architecture et les règles de développement du projet **Gen AI Starter Kit**. Il sert de référence unique pour toute IA ou développeur rejoignant le projet.

---

## 1. Philosophie & Principes Directeurs

- **Clean Architecture Stricte (Backend) :** Isolation totale du code métier (`core`) vis-à-vis des frameworks et bases de données (`infra`, `interface`).
- **TDD First (Test Driven Development) :** On écrit le test du Use Case **avant** l'implémentation. Pas de code métier sans test.
- **Approche Fonctionnelle :** Pas de classes "Service" lourdes. On utilise le **Factory Pattern** pour l'injection de dépendances (voir section Patterns).
- **Raw Tailwind (Frontend) :** Pas de librairies UI complexes (type Shadcn) qui créent des conflits. On utilise Tailwind CSS natif + `lucide-react` + `cn()` utility.
- **Simplicité & Robustesse :** On privilégie un code lisible et explicite. Pas de "magie" cachée.

---

## 2. Stack Technique

### 🏗 Infrastructure

- **Runtime :** Node.js 22+ (ESM).
- **Containerisation :** Docker & Docker Compose (Dev & Prod).
- **Proxy/SSL :** Traefik v3.
- **CI/CD :** GitHub Actions (Preview envs & Production).
- **Secrets :** Gestion via `.env` en local et GitHub Secrets/Docker Env en prod.

### 🔙 Backend (`apps/api`)

- **Framework :** Hono (Standards Web, léger).
- **Validation :** Zod (Validation stricte des Inputs et Variables d'Env).
- **Database :** PostgreSQL 15.
- **ORM :** Drizzle ORM (Type-safe, SQL-like).
- **Testing :** Vitest (Rapide, compatible Jest).
- **Auth :** Better-Auth.
- **AI :** OpenAI SDK (via Adapter).

### 🎨 Frontend (`apps/web`)

- **Framework :** React + Vite + TypeScript.
- **State Server :** TanStack Query (React Query).
- **HTTP Client :** Axios (Configuré avec Interceptors).
- **Routing :** React Router DOM v6 (Nested Layouts).
- **Styling :** Tailwind CSS + Typography plugin.
- **Markdown :** `react-markdown`.
- **UX :** `sonner` (Toasts).

---

## 3. Architecture Détaillée (Backend)

Le backend suit une architecture hexagonale simplifiée en 3 couches :

```
apps/api/src/
├── core/                # 🧠 DOMAIN (Zéro dépendance technique)
│   ├── entities/        # Types TS & Zod Schemas
│   ├── ports/           # Interfaces (Contrats) pour l'Infra
│   ├── errors/          # Erreurs métier custom
│   └── use-cases/       # Logique métier pure + Tests Unitaires
│
├── infra/               # 🔌 ADAPTERS (Implémentations)
│   ├── adapters/        # Implémentation des Ports (OpenAI, Drizzle...)
│   ├── db/              # Schema Drizzle & Config
│   └── auth.ts          # Config Better-Auth
│
└── interface/           # 🗣️ DRIVERS (Points d'entrée)
    ├── http/            # Serveur Hono, Routes, Middlewares
    └── env.ts           # Validation Environment (Zod)
```

### 🔑 Pattern d'Injection (Factory Function)

Nous n'utilisons pas de conteneur DI complexe. L'injection se fait manuellement via des closures.

**Exemple de Use Case :**

```typescript
// 1. Définition du type
type MyUseCase = (input: string) => Promise<Result>

// 2. Factory (Reçoit les Ports/Adapters)
export const makeMyUseCase = (repo: Repository, ai: AIProvider): MyUseCase => {
  // 3. Retourne la fonction métier (Closure)
  return async (input) => {
    // Logique pure...
    return result
  }
}
```

**Exemple d'Assemblage (`routes/xxx.ts`) :**

```typescript
const useCase = makeMyUseCase(dbAdapter, openaiAdapter) // Injection
const result = await useCase("input") // Exécution
```

---

## 4. Architecture Détaillée (Frontend)

### Structure

```
apps/web/src/
├── components/   # Composants réutilisables (Button, Card...)
├── layouts/      # Layouts (DashboardLayout avec Sidebar fixe)
├── lib/          # Configs (api.ts, auth-client.ts, utils.ts)
├── pages/        # Écrans complets (Dashboard, Generator, Login)
└── App.tsx       # Routing & Providers
```

### Règles de Routing

- Les routes protégées sont imbriquées dans `<DashboardLayout />`.
- Utilisation de `<Outlet />` pour le rendu des pages enfants.
- Redirection automatique Login <-> Dashboard selon l'état de session.

### Règles d'API

- `api.ts` : Instance Axios configurée. Pointe toujours vers `/api`. Gère le refresh token/logout sur 401.
- `auth-client.ts` : Instance Better-Auth.

---

## 5. Modèle de Données (Database)

**Table `user` (Gérée par Better-Auth)**

- `id`, `email`, `name`, `image`, ...

**Table `generation` (Métier)**

- `id` (UUID)
- `userId` (FK -> user.id)
- `prompt` (Text - Input utilisateur)
- `result` (Text - Output IA)
- `createdAt` (Timestamp)

---

## 6. Workflow de Développement (Guide)

### Comment ajouter une Feature Backend ?

1.  **Port** : Définir l'interface dans `core/ports`.
2.  **Test (RED)** : Créer `core/use-cases/my-feature.test.ts`. Mocker le port.
3.  **Use Case (GREEN)** : Implémenter la logique dans `core/use-cases/my-feature.ts`.
4.  **Adapter** : Implémenter l'interface dans `infra/` (ex: appel DB ou API tierce).
5.  **Route** : Créer la route Hono dans `interface/http/routes/`, injecter l'adapter, valider l'input avec Zod.

### Comment ajouter une Page Frontend ?

1.  **API Call** : Utiliser `api.post()` ou `api.get()` dans `pages/my-page.tsx`.
2.  **State** : Wrapper l'appel dans `useMutation` (Action) ou `useQuery` (Lecture).
3.  **UI** : Construire l'interface avec Tailwind. Utiliser `react-markdown` si texte riche.
4.  **Routing** : Ajouter la route dans `App.tsx` (dans le bloc DashboardLayout) et le lien dans la Sidebar (`layouts/DashboardLayout.tsx`).

---

## 7. Variables d'Environnement

**Local (`apps/api/.env`) :**

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/webapp
REDIS_URL=redis://localhost:6379
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-...  <-- CRITIQUE
```

**Docker / Prod :**
Les variables doivent être passées via `docker-compose.yml` et GitHub Secrets.

---

## 8. État Actuel & Roadmap

**✅ Fonctionnel (Done) :**

- Auth complète (Email/Password).
- Génération de résumé IA (Connecté OpenAI).
- Persistance en DB (Table `generation`).
- Dashboard avec Historique & Markdown rendering.
- UX (Toasts, Loading states, Sidebar responsive).

**🚀 À Faire (Next Steps) :**

1.  **Sécurité :** Rate Limiting (Redis) sur la route `/api/ai/*`.
2.  **Async :** Déplacer le traitement IA dans un Worker BullMQ (pour les timeouts > 30s).
3.  **Monétisation :** Intégration Stripe & Gestion de crédits.

---

## 9. Commandes Utiles

- **Lancer la stack (Local) :**
  - Terminal 1 (Infra) : `docker compose -f docker-compose.dev.yml up -d`
  - Terminal 2 (API) : `cd apps/api && npm run dev`
  - Terminal 3 (Web) : `cd apps/web && npm run dev`
- **Tests Backend :** `cd apps/api && npm test`
- **Migration DB :**
  - Générer : `npm run db:generate`
  - Appliquer (Local) : `npx drizzle-kit push`
  - Voir les données : `npx drizzle-kit studio`
