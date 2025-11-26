# 📘 GEN AI STARTER KIT - MASTER CONTEXT (V4)

Ce document décrit l'état technique, l'architecture et les règles de développement du projet **Gen AI Starter Kit**. Il sert de référence unique pour toute IA ou développeur rejoignant le projet.

---

## 1. Philosophie & Principes Directeurs

- **Clean Architecture Stricte (Backend) :** Isolation totale du code métier (`core`) vis-à-vis des frameworks et bases de données (`infra`, `interface`).
- **Workflow First :** Tout processus long ou complexe (Génération IA) est modélisé sous forme de Workflow asynchrone, résilient et observable.
- **TDD First :** Pas de code métier sans test.
- **Approche Fonctionnelle :** Utilisation de Factory Patterns et de Closures. Pas de Classes Service lourdes.
- **Raw Tailwind (Frontend) :** Pas de lib UI complexe. Tailwind CSS natif + `lucide-react` + `cn()`.

---

## 2. Stack Technique

### 🏗 Infrastructure

- **Runtime :** Node.js 22+ (ESM).
- **Containerisation :** Docker & Docker Compose (Postgres + Redis).
- **Queueing :** Redis + BullMQ (Gestion des jobs asynchrones).
- **CI/CD :** GitHub Actions.

### 🔙 Backend (`apps/api`)

- **Framework :** Hono.
- **Database :** PostgreSQL 15 via Drizzle ORM.
- **Validation :** Zod.
- **Testing :** Vitest.
- **Auth :** Better-Auth.
- **Workflow Engine :** Moteur Custom sur BullMQ (voir section Architecture).

### 🎨 Frontend (`apps/web`)

- **Framework :** React + Vite + TypeScript.
- **State Server :** TanStack Query.
- **Styling :** Tailwind CSS.

---

## 3. Architecture Détaillée (Backend)

Architecture hexagonale en 3 couches + Moteur de Workflow :

```
apps/api/src/
├── core/                # 🧠 DOMAIN
│   ├── entities/        # Types TS & Zod Schemas
│   ├── ports/           # Interfaces (Contrats)
│   ├── use-cases/       # Logique métier unitaire
│   └── workflows/       # ⚡ Définitions des Workflows (Orchestration)
│       ├── types.ts     # Grammaire du moteur
│       └── registry.ts  # Map des workflows actifs
│
├── infra/               # 🔌 ADAPTERS
│   ├── adapters/        # BullMQWorkflowEngine, OpenAI...
│   ├── db/              # Schema Drizzle (workflow_run, workflow_step...)
│   └── auth.ts          # Config Better-Auth
│
└── interface/           # 🗣️ DRIVERS
    └── http/            # Serveur Hono
```

---

## 4. Le Moteur de Workflow (Custom Engine)

Nous utilisons un moteur maison basé sur BullMQ pour orchestrer les tâches IA.

### Principes

1.  **Code-First :** Les workflows sont définis en TypeScript dans `core/workflows/`.
2.  **Stateful :** L'état est persisté en DB (`workflow_run`, `workflow_step`) à chaque étape.
3.  **Human-in-the-loop :** Capacité de mettre un workflow en pause (`WAITING_FOR_INPUT`) indéfiniment.

### Grammaire (Comment écrire un Workflow)

```typescript
// Exemple : core/workflows/my-workflow.ts
export const myWorkflow = defineWorkflow({
  id: "my-process",
  initialStep: "step-1",
  steps: {
    "step-1": {
      next: "step-2",
      run: async (ctx) => {
        // Logique pure ou appel de Use Case
        return step({ someData: "hello" })
      },
    },
    "step-2": {
      next: null, // Fin
      run: async (ctx) => {
        // Accès à l'historique
        const prev = ctx.history["step-1"]
        return step({ result: prev.someData + " world" })
      },
    },
  },
})
```

### Primitives Disponibles

- `step(payload)` : Termine l'étape avec succès.
- `Workflow.spawn(name, inputs)` : Lance des sous-workflows en parallèle (Pattern Fan-out).
- `Workflow.waitForEvent(name)` : Met le workflow en pause jusqu'à appel API (Validation humaine).

---

## 5. Modèle de Données (Database)

**Tables Système Workflow**

- `workflow_run` : L'instance globale. Contient le `context` (mémoire JSON) et le `status`.
- `workflow_step` : L'historique d'exécution. Logs des inputs/outputs par étape.

**Tables Métier**

- `user` (Better-Auth).
- `generation` (Résultats finaux).

---

## 6. Workflow de Développement

### Comment ajouter une Feature "Complexe" (Workflow) ?

1.  **Use Cases :** Créer les briques unitaires (ex: `GenerateImage`, `SaveData`) dans `core/use-cases`.
2.  **Definition :** Assembler ces briques dans un fichier `core/workflows/xxx.workflow.ts`.
3.  **Registry :** Enregistrer le workflow dans `core/workflows/registry.ts`.
4.  **Trigger :** Appeler `workflowEngine.startWorkflow('xxx', input)` depuis une route API.

---

## 7. Variables d'Environnement (Nouveau)

Ajout de Redis pour le moteur :

```env
# ... existants
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 8. État Actuel & Roadmap

**✅ Fonctionnel (Done) :**

- Auth complète.
- Architecture Hexagonale en place.
- **Moteur de Workflow V1 (BullMQ + Persistence).**
- Support des tâches séquentielles.

**🚀 À Faire (Next Steps) :**

1.  **Implémentation Métier :** Créer le vrai workflow "Landing Page Generator" (Brief -> Structure -> Contenu).
2.  **Frontend Workflow :** Afficher la barre de progression en temps réel (Polling sur `workflow_step`).
3.  **Human Validation :** Implémenter le `waitForEvent` pour la validation client.
4.  **Flows :** Gérer le `spawn` pour générer les images en parallèle.

---

## 9. Commandes Utiles

- **Lancer la stack (Infra) :** `docker compose -f docker-compose.dev.yml up -d` (Lance Postgres ET Redis).
- **Lancer l'API + Worker :** `cd apps/api && npm run dev`.
- **Voir les jobs Redis (Optionnel) :** Utiliser un outil comme "BullMQ Dashboard" ou "RedisInsight".

```

***

Et voilà ! Tu es paré pour la suite. La prochaine fois qu'on ouvre une session, l'IA saura exactement comment fonctionne ton moteur et pourra t'aider à coder le workflow "Landing Page" complexe sans réinventer la roue. 🔥
```
