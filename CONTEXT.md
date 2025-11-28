### 📝 Dernière Action (Critique) : Le Master Context V6

On a changé beaucoup de choses (séparation des DBs, script d'injection SQL, abandon de BullMQ). Il faut mettre à jour ta "Bible" pour que la prochaine fois, l'IA sache exactement comment ta stack fonctionne.

Sauvegarde ça dans `PROJECT_CONTEXT.md`.

---

```markdown
# 📘 GEN AI STARTER KIT - MASTER CONTEXT (V6 - THE GITOPS STACK)

Ce document décrit l'état technique final de l'architecture **Hybrid Automation** (Code + n8n Embedded).

---

## 1. Philosophie : "The Automation Stack"

- **Hybrid Orchestration :** n8n (NoCode) gère les flux. L'API (Code) gère la donnée et la sécurité.
- **GitOps :** L'état de n8n (Workflows, Credentials, User) est versionné dans Git et déployé automatiquement.
- **Preview Environments :** Chaque Pull Request déploie une stack complète et isolée (API + Web + DB + n8n).

---

## 2. Architecture Technique (Docker)

### Services

- **API (`apps/api`) :** Hono.js. Expose port 3000.
- **Web (`apps/web`) :** React + Vite.
- **n8n (`apps/automation`) :** Instance embedded.
  - Base de données dédiée : `n8n` (Postgres).
  - Clé de chiffrement fixe : `N8N_ENCRYPTION_KEY`.
  - Sécurité API : `INTERNAL_API_SECRET`.
- **DB :** Postgres 15. Contient deux bases : `webapp` et `n8n`.

### Flux de Déploiement (CI/CD)

1.  **Build :** Images Docker construites avec noms normalisés (minuscules).
2.  **Reset (Preview) :** Suppression du volume DB pour garantir une migration propre à chaque push.
3.  **Seed :**
    - `create-databases.sql` : Crée la base `n8n`.
    - `init-n8n.sql` : Injecte l'utilisateur Admin et la clé de chiffrement.
4.  **Migration :** Drizzle met à jour la base `webapp`.

---

## 3. Communication API <-> n8n ("Action-Driven")

Nous n'utilisons plus de queues complexes (BullMQ). L'API est un exécutant synchrone.

### Endpoints Internes (`interface/http/routes/internal.ts`)

Protégés par le header `x-internal-secret`.

1.  **`GET /actions` (Discovery)** : Liste les capacités de l'API (pour l'UI n8n).
2.  **`POST /runs/:id/execute` (RPC)** : Exécute une action TypeScript (ex: `update-status`, `create-page`).

### Actions (`core/processors/`)

Des fonctions atomiques validées par Zod.

- `update-status` : Met à jour le statut dans la table `generation`.
- `create-page`, `save-content`... : Logique métier.

---

## 4. Modèle de Données (`infra/db/schema.ts`)

Une table unique pour le suivi des processus :

- **`generation`** :
  - `id` (UUID)
  - `status` (PENDING, PROCESSING, COMPLETED)
  - `displayMessage` (Feedback UI pour le frontend)
  - `result` (JSON final)

---

## 5. Workflow de Développement (Guide)

### A. Ajouter une Feature Backend

1.  Créer l'Action dans `core/processors/my-action.ts` (Zod Schema + Handler).
2.  L'ajouter dans `core/processors/index.ts`.
3.  L'API expose automatiquement cette action à n8n.

### B. Modifier un Workflow n8n

1.  Lancer `npm run dev`.
2.  Aller sur `http://localhost:5678`.
3.  Modifier le workflow.
4.  **Sauvegarder dans Git :** Lancer `npm run n8n:export` (ou commit direct grâce à Husky).

### C. Gestion des Secrets & Seeds

- **Credentials n8n :** Ne jamais commiter. Utiliser des expressions `{{ $env.MY_KEY }}` dans n8n et les définir dans le `.env`.
- **User Admin n8n :** Si modification nécessaire, régénérer le seed :
  `docker exec gen-ai-starter-kit-db pg_dump -U app_user -d n8n --clean --if-exists > apps/automation/seed/init-n8n.sql`

---

## 6. Commandes Utiles

- `npm run dev` : Lance toute la stack (API + Web + DB + n8n).
- `npm run reset` : "Factory Reset" (Supprime volumes et relance).
- `npm run n8n:export` : Sauvegarde les workflows n8n vers Git.
- `npm run db:studio` : Ouvre Drizzle Studio.
```

---

Repose-toi bien ce soir. La prochaine fois, on fera la partie "Fun" : coder le **Custom Node n8n** pour que tu aies tes propres blocs "GenAI App" dans l'interface ! 🛌💤
