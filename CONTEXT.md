◊Tu as raison, le diable est dans les détails, et comme c'est un pivot majeur, il vaut mieux que tout soit écrit noir sur blanc pour ne rien perdre de notre brainstorming.

Voici la **Version Complète et Détaillée (V5)**. Elle capture tout : le Zero-Config, le Discovery, le Docker Embed, le GitOps et la logique du Custom Node.

Sauvegarde ça, c'est ton assurance tranquillité. Et bonne formation demain ! 😉

---

# 📘 GEN AI STARTER KIT - MASTER CONTEXT (V5 - THE AUTOMATION STACK)

Ce document décrit l'architecture pivot du projet. Nous passons d'une orchestration pure code (BullMQ) à une orchestration hybride **Code + n8n Embedded**.

---

## 1. Philosophie : "The Pro Automation Stack"

- **Hybrid Orchestration :**
  - **n8n (Le Chef de Chantier)** : Gère le flux, les boucles, les appels API externes, et le "Wiring" visuel.
  - **Code (L'Artisan)** : Gère la validation (Zod), la persistance critique (DB Relationnelle), et l'Auth.
- **n8n as a Service (Embedded) :** n8n n'est pas un SaaS externe. Il tourne dans le `docker-compose` du projet.
  - **Isolation :** Chaque environnement (Local, Preview PR, Prod) possède son propre n8n isolé.
  - **Réseau :** n8n communique avec l'API via le réseau Docker interne (`http://api:3000`).
- **GitOps & Versioning :** Les workflows n8n ne vivent pas dans la DB de n8n uniquement. Ils sont exportés en JSON dans le repo Git (`apps/automation/workflows`) et chargés au démarrage.
- **Developer Experience (DX) :** Aucune configuration manuelle requise. Le Custom Node se configure tout seul ("Zero-Config").

---

## 2. Architecture Technique

### 🏗 Infrastructure (Docker Compose)

| Service | Rôle                   | Configuration Réseau                                          |
| :------ | :--------------------- | :------------------------------------------------------------ |
| **API** | Backend Hono + Drizzle | Expose port `3000` (Interne: `http://api:3000`)               |
| **DB**  | PostgreSQL             | Stockage métier + Stockage n8n                                |
| **n8n** | Moteur de Workflow     | Expose port `5678`. Pré-configuré avec `INTERNAL_API_SECRET`. |

### 🔐 Sécurité "Machine-to-Machine"

Pas de OAuth complexe entre n8n et l'API. Ils partagent un secret dans le `.env`.

- **API :** Vérifie le header `x-internal-secret`.
- **n8n (Custom Node) :** Injecte automatiquement ce header via `process.env.INTERNAL_API_SECRET`.

---

## 3. Le "Protocol" (Communication API <-> n8n)

Nous utilisons deux patterns complémentaires pour gérer les données.

### A. Pattern "Scratchpad" (Mémoire Partagée)

Une zone JSON temporaire pour stocker l'avancement du workflow et afficher l'UI en temps réel.

- **n8n** : Pousse des données en vrac (`{ "step": "generating", "draft_title": "..." }`).
- **Frontend** : Polling sur ce JSON pour afficher le loader ou les résultats intermédiaires.

### B. Pattern "Toolbox" (Remote Procedure Call)

n8n demande à l'API d'exécuter une fonction TypeScript précise et sécurisée.

- **n8n** : "Exécute `create-page` avec `{ title: 'Hello' }`".
- **API** : Valide le payload avec Zod, écrit dans la table `Page` (SQL), et retourne `{ pageId: 123 }`.

---

## 4. Implémentation Backend (`apps/api`)

L'API devient une passerelle intelligente qui expose ses capacités.

### Structure des Dossiers

```
apps/api/src/
├── core/
│   └── processors/           # 🧰 La Boîte à Outils (Toolbox)
│       ├── index.ts          # ActionRegistry (Map String -> Function)
│       ├── create-page.ts    # Action unitaire (Schema Zod + Logique DB)
│       └── generate-pdf.ts   # Action unitaire
│
├── infra/
│   └── db/schema.ts          # Table `generation_run` (id, status, scratchpad: jsonb)
│
└── interface/
    └── http/
        ├── routes/
        │   └── internal.ts   # Routes privées pour n8n
        └── middlewares/
            └── internal-auth.ts # Guard sur `x-internal-secret`
```

### Les 3 Endpoints Magiques (`internal.ts`)

1.  **`GET /internal/actions` (Discovery)**
    - Retourne la liste des actions disponibles et leurs schémas (pour l'UI de n8n).
2.  **`PATCH /internal/runs/:id/scratchpad` (State)**
    - Merge le payload reçu avec le JSON existant en DB.
3.  **`POST /internal/runs/:id/execute` (RPC)**
    - Reçoit `{ action: "nom-action", payload: { ... } }`.
    - Trouve l'action dans le `ActionRegistry`.
    - Valide Zod.
    - Exécute et retourne le résultat.

---

## 5. Implémentation Automation (`apps/automation`)

### Le Custom Node : "GenAI App Node" 🪄

C'est un nœud n8n natif (développé en TypeScript) spécifique à notre projet.

**Fonctionnalités Clés :**

1.  **Zero-Config :**

    - `Base URL` par défaut = `http://api:3000`.
    - `API Key` lue depuis `process.env.INTERNAL_API_SECRET`.
    - L'utilisateur n'a RIEN à configurer en drag & drop.

2.  **Auto-Discovery (Listes Déroulantes) :**

    - Le nœud interroge `GET /internal/actions` au chargement.
    - Le champ "Action" devient une liste déroulante avec les vrais noms des fonctions (`create-page`, `publish-post`...). Impossible de faire une typo.

3.  **Opérations :**
    - **Update State :** Wrapper simple vers l'endpoint Scratchpad.
    - **Execute Action :** Affiche dynamiquement les champs requis selon l'action choisie (si possible) ou un champ JSON.

---

## 6. Workflow de Développement (Le Cycle de Vie)

### Initialisation

1.  `docker compose up` : Lance toute la stack.
2.  Un script d'entrypoint dans n8n importe les workflows depuis `apps/automation/workflows/*.json`.

### Ajouter une Feature (ex: "Save to Notion")

1.  **Côté Code :**
    - Créer `core/processors/save-notion.ts` avec son schema Zod.
    - L'ajouter dans `ActionRegistry`.
2.  **Côté n8n :**
    - Rafraîchir l'éditeur.
    - Le Custom Node affiche maintenant "Save to Notion" dans la liste.
    - L'ajouter au workflow visuel.
3.  **Sauvegarde :**
    - `npm run n8n:export` : Dump le JSON du workflow dans le dossier Git.
    - Commit & Push.

---

## 7. Roadmap de Migration

1.  **Nettoyage :**
    - Supprimer `bullmq`, `redis` (code), et le dossier `core/workflows` actuel.
2.  **Infra :**
    - Ajouter le service `n8n` au `docker-compose.dev.yml` (Image custom ou officielle avec build step).
3.  **Backend Core :**
    - Implémenter `ActionRegistry` et la table `generation_run`.
4.  **Backend API :**
    - Implémenter les routes `internal.ts` et l'auth par secret.
5.  **n8n Custom Node :**
    - Initialiser le package du node.
    - Coder la logique de Discovery et d'injection d'Auth.

---
