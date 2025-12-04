### 📝 Dernière Action (Critique) : Le Master Context V6

On a consolidé l'architecture autour de **BullMQ** pour la scalabilité et de **n8n** pour l'orchestration. Il faut mettre à jour ta "Bible" pour que la prochaine fois, l'IA sache exactement comment ta stack fonctionne.

Sauvegarde ça dans `PROJECT_CONTEXT.md`.

---

```markdown
# 📘 GEN AI STARTER KIT - MASTER CONTEXT (V6 - THE SCALABLE STACK)

Ce document décrit l'état technique final de l'architecture **Hybrid Automation** (Code + n8n Embedded).

---

## 1. Philosophie : "The Automation Stack"

- **Hybrid Orchestration :** n8n (NoCode) gère les flux. L'API (Code) gère la donnée, la sécurité et la scalabilité.
- **Scalable Queues :** BullMQ (Redis) absorbe la charge et distribue les jobs aux workers.
- **GitOps :** L'état de n8n (Workflows, Credentials, User) est versionné dans Git et déployé automatiquement.
- **Preview Environments :** Chaque Pull Request déploie une stack complète et isolée.

---

## 2. Architecture Technique (Docker)

### Services

- **API (`apps/api`) :** Hono.js. Expose port 3000.
    - **Producer :** Pousse les jobs dans Redis.
    - **Worker :** Consomme les jobs et appelle n8n.
- **Web (`apps/web`) :** React + Vite.
- **n8n (`apps/automation`) :** Instance embedded.
  - Base de données dédiée : `n8n` (Postgres).
  - Clé de chiffrement fixe : `N8N_ENCRYPTION_KEY`.
  - Sécurité API : `INTERNAL_API_SECRET`.
- **DB :** Postgres 15. Contient deux bases : `webapp` et `n8n`.
- **Redis :** Pour BullMQ.

### Flux de Déploiement (CI/CD)

1.  **Build :** Images Docker construites avec noms normalisés (minuscules).
2.  **Reset (Preview) :** Suppression du volume DB pour garantir une migration propre à chaque push.
3.  **Seed :**
    - `create-databases.sql` : Crée la base `n8n`.
    - `init-n8n.sql` : Injecte l'utilisateur Admin et la clé de chiffrement.
4.  **Migration :** Drizzle met à jour la base `webapp`.

---

## 3. Communication API <-> n8n ("Queue-Driven")

L'architecture est asynchrone et résiliente grâce à BullMQ.

### Le Flux "Queue -> Worker -> Webhook -> Poll"

1.  **Trigger (API)** : L'API reçoit une requête (ex: `POST /generate`) et push un job dans une queue BullMQ (ex: `page-generation`).
2.  **Process (Worker)** :
    -   Le Worker dépile le job.
    -   Il met à jour le statut en DB (`RUNNING`).
    -   Il appelle le **Webhook n8n** correspondant via HTTP (sécurisé par `x-internal-secret`).
3.  **Orchestration (n8n)** :
    -   n8n exécute le workflow (logique métier, appels IA, etc.).
    -   **IMPORTANT :** n8n ne touche JAMAIS la DB `webapp` directement. Il renvoie le résultat au Worker ou appelle l'API pour sauvegarder.
4.  **Completion (Worker)** :
    -   Le Worker poll la DB (ou attend la réponse synchrone du webhook si configuré ainsi) pour vérifier la fin du traitement.
    -   Il marque le job comme `COMPLETED` ou `FAILED`.

---

## 4. Modèle de Données (`infra/db/schema.ts`)

Une table unique pour le suivi des processus :

- **`generation`** (ou `workflows`) :
  - `id` (UUID)
  - `status` (PENDING, RUNNING, COMPLETED, FAILED)
  - `displayMessage` (Feedback UI pour le frontend)
  - `result` (JSON final)
  - `error` (Message d'erreur si failed)

---

## 5. Workflow de Développement (Guide)

### A. Ajouter une Feature Backend
1.  Définir la Queue dans `apps/api/src/workflows/config.ts`.
2.  Créer le Worker Processor.
3.  Exposer l'endpoint qui ajoute le job à la queue.

### B. Modifier un Workflow n8n
1.  Lancer `npm run dev`.
2.  Aller sur `http://localhost:5678`.
3.  Modifier le workflow.
4.  **Sauvegarder dans Git :** Lancer `npm run n8n:export` (ou commit direct grâce à Husky).

### C. Gestion des Secrets & Seeds
- **Credentials n8n :** Ne jamais commiter. Utiliser des expressions `{{ $env.MY_KEY }}` dans n8n et les définir dans le `.env`.

---

## 6. Commandes Utiles

- `npm run dev` : Lance toute la stack (API + Web + DB + n8n + Redis).
- `npm run reset` : "Factory Reset" (Supprime volumes et relance).
- `npm run n8n:export` : Sauvegarde les workflows n8n vers Git.
- `npm run db:studio` : Ouvre Drizzle Studio.
```

---

C'est propre, scalable et documenté. On est parés pour la suite ! 🚀
