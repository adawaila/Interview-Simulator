# InterviewAI - Simulateur d'Entrevues Techniques

Plateforme d'entrevues techniques augmentée par IA utilisant Groq (Llama 3.3 70B), permettant aux développeurs de pratiquer des coding interviews avec feedback adaptatif en temps réel.

## Fonctionnalités

- **4 types d'entrevues**: Algorithmes, System Design, Comportemental, Basé sur offre d'emploi
- **3 niveaux de difficulté**: Junior, Intermédiaire, Senior
- **Éditeur de code intégré**: Monaco Editor avec support Python, JavaScript, Java, C++
- **Exécution de code en temps réel**: Via l'API Piston (gratuite)
- **Feedback IA détaillé**: Scores, points forts, axes d'amélioration
- **Historique des entrevues**: Suivi de progression

## Stack Technique

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de données**: SQLite avec Prisma ORM
- **IA**: Groq API (Llama 3.3 70B - gratuit)
- **Code Execution**: Piston API (gratuit)
- **State Management**: Zustand

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Clé API Groq (gratuite sur https://console.groq.com)

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd interview_practic
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé API Groq:
```
GROQ_API_KEY="gsk_votre_cle_api"
```

4. **Initialiser la base de données**
```bash
npx prisma db push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

6. **Ouvrir l'application**
Accédez à http://localhost:3000

## Utilisation

### Nouvelle Entrevue

1. Sélectionnez le type d'entrevue
2. Choisissez le niveau de difficulté
3. Définissez la durée
4. Pour les entrevues basées sur offre d'emploi, collez l'offre et cliquez "Analyser"
5. Cliquez "Commencer l'Entrevue"

### Pendant l'Entrevue

- Répondez aux questions de l'interviewer IA dans le chat
- Pour les entrevues d'algorithmes, utilisez l'éditeur de code à droite
- Le timer affiche le temps restant
- Cliquez "Terminer" quand vous êtes prêt

### Après l'Entrevue

- Consultez votre score global et les scores détaillés
- Lisez les points forts et axes d'amélioration
- Découvrez les sujets recommandés à étudier

## Structure du Projet

```
src/
├── app/
│   ├── api/           # Routes API
│   │   ├── analyze-job/   # Analyse d'offre d'emploi
│   │   ├── chat/          # Streaming chat avec IA
│   │   ├── evaluate/      # Évaluation post-entrevue
│   │   ├── execute/       # Exécution de code
│   │   └── interview/     # CRUD entrevues
│   ├── history/       # Page historique
│   ├── interview/[id]/    # Page entrevue
│   └── results/[id]/      # Page résultats
├── components/
│   └── interview/     # Composants réutilisables
│       ├── chat-interface.tsx
│       ├── code-editor.tsx
│       ├── results-panel.tsx
│       └── timer.tsx
└── lib/
    ├── db.ts          # Client Prisma
    ├── groq.ts        # Client Groq
    ├── prompts.ts     # Prompts système
    └── store.ts       # État global Zustand
```

## Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL de la base SQLite | Oui |
| `GROQ_API_KEY` | Clé API Groq | Oui |
| `PISTON_API_URL` | URL API Piston | Non (défaut fourni) |

## Déploiement sur Vercel

1. Poussez le code sur GitHub
2. Importez le repo sur Vercel
3. Ajoutez les variables d'environnement:
   - `GROQ_API_KEY`: Votre clé API
   - `DATABASE_URL`: Utilisez une base PostgreSQL (Vercel Postgres ou Supabase)
4. Déployez!

Pour PostgreSQL, modifiez `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Coûts

- **Groq API**: Gratuit (limites généreuses)
- **Piston API**: Gratuit
- **Vercel**: Gratuit (hobby tier)
- **Supabase/Vercel Postgres**: Gratuit (free tier)

## Contribuer

Les contributions sont les bienvenues! Ouvrez une issue ou une pull request.

## Licence

MIT
