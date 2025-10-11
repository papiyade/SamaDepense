# 💰 SamaDepense - PWA de Gestion Financière

> Application Progressive Web App (PWA) moderne pour la gestion des finances personnelles avec épargne et gamification.

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![PWA](https://img.shields.io/badge/PWA-Ready-emerald)
![Offline](https://img.shields.io/badge/Offline-Support-emerald)
![Mobile](https://img.shields.io/badge/Mobile-First-emerald)

## 🎯 Vue d'ensemble

SamaDepense est une application PWA complète qui aide les utilisateurs à mieux gérer leurs finances personnelles au quotidien. Elle fonctionne hors ligne, s'installe comme une app native, et offre une expérience utilisateur moderne et intuitive.

### ✨ Fonctionnalités principales

- 📱 **PWA Native** - Installation en un clic sur tous les appareils
- 🔄 **Mode Hors Ligne** - Fonctionne sans connexion internet
- 💰 **Gestion Multi-Épargne** - Créez plusieurs coffres d'épargne
- 📊 **Tableaux de Bord** - Visualisations graphiques interactives
- 🎮 **Gamification** - Badges et objectifs motivants
- 🔔 **Notifications** - Rappels et alertes personnalisés
- 📈 **Suivi Avancé** - Historiques et analyses détaillées

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/papiyade/SamaDepense.git
cd SamaDepense

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

### 📱 Installation PWA

1. Ouvrez l'application dans votre navigateur
2. Cliquez sur le bouton "Installer" qui apparaît
3. Confirmez l'installation
4. L'app sera disponible sur votre écran d'accueil !

## 🏗️ Architecture technique

### Stack principal

- **Frontend** : React 18 + TypeScript
- **Styling** : TailwindCSS + Framer Motion
- **PWA** : Vite PWA Plugin + Workbox
- **État** : Zustand
- **Base de données** : IndexedDB (Dexie.js)
- **Build** : Vite
- **Icons** : Lucide React

### Structure du projet

```
src/
├── components/          # Composants React
│   ├── PWAPrompt.tsx   # Composants PWA (installation, mises à jour)
│   └── ...
├── stores/             # Stores Zustand
├── lib/                # Utilitaires et services
│   └── pwa.ts         # Gestionnaire PWA principal
├── types/              # Types TypeScript
└── utils/              # Fonctions utilitaires

public/
├── manifest.json       # Manifest PWA
├── sw.js              # Service Worker personnalisé
├── offline.html       # Page hors ligne
├── icons/             # Icônes PWA (toutes tailles)
└── screenshots/       # Captures d'écran pour stores
```

## 🎨 Design System

### Palette de couleurs

- **Primary** : Emerald (finance/croissance)
- **Secondary** : Gray (sobriété)
- **Accents** : Couleurs catégories (bleu, orange, violet...)
- **Background** : Blanc/Gris clair
- **Text** : Gris foncé

### Composants UI

- **Cards** : Arrondis 2xl, ombres douces
- **Buttons** : Transitions fluides, états hover/active
- **Forms** : Validation en temps réel
- **Charts** : Recharts avec animations
- **Navigation** : Bottom nav mobile, sidebar desktop

## 💾 Gestion des données

### Stockage local (IndexedDB)

```typescript
// Exemple de structure de données
interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  date: Date
  type: 'income' | 'expense'
  savingsBoxId?: string
}

interface SavingsBox {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  color: string
  icon: string
}
```

### Synchronisation

- **Hors ligne** : Toutes les données stockées localement
- **En ligne** : Synchronisation automatique (quand backend disponible)
- **Conflits** : Résolution intelligente avec timestamps

## 🔧 Configuration PWA

### Manifest.json

```json
{
  "name": "SamaDepense - Gestion Financière",
  "short_name": "SamaDepense",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "start_url": "/",
  "scope": "/"
}
```

### Service Worker

- **Cache Strategy** : Cache First pour assets, Network First pour API
- **Background Sync** : Synchronisation en arrière-plan
- **Push Notifications** : Notifications natives
- **Update Management** : Mises à jour automatiques

## 📱 Fonctionnalités PWA

### Installation

- Prompt d'installation automatique
- Support tous navigateurs (Chrome, Safari, Firefox, Edge)
- Installation depuis les app stores (quand configuré)

### Mode hors ligne

- Interface complète disponible hors ligne
- Synchronisation automatique au retour de connexion
- Page offline dédiée avec informations utiles

### Notifications

```typescript
// Exemple d'utilisation
await pwaManager.sendNotification('Budget atteint !', {
  body: 'Votre budget courses a été dépassé',
  icon: '/icons/icon-192x192.png',
  actions: [
    { action: 'view', title: 'Voir détails' },
    { action: 'dismiss', title: 'Ignorer' }
  ]
})
```

## 🎮 Gamification

### Système de badges

- 🏆 **Épargnant** : Premier coffre créé
- 💎 **Diamant** : 10 000 CFA épargnés
- 📊 **Analyste** : 30 jours de suivi consécutifs
- 🎯 **Précis** : Objectif d'épargne atteint

### Objectifs

- Objectifs d'épargne personnalisables
- Suivi de progression visuel
- Récompenses et encouragements

## 📊 Analytics et métriques

### Tableaux de bord

- **Vue mensuelle** : Revenus, dépenses, épargnes
- **Catégories** : Répartition par type de dépense
- **Tendances** : Évolution sur plusieurs mois
- **Objectifs** : Progression vers les objectifs

### Graphiques

- Camembert (répartition des dépenses)
- Barres (évolution mensuelle)
- Lignes (tendances)
- Jauges (progression objectifs)

## 🔒 Sécurité et confidentialité

### Données locales

- Toutes les données stockées localement
- Pas de transmission vers des serveurs tiers
- Chiffrement des données sensibles (optionnel)

### PWA Security

- HTTPS obligatoire
- Service Worker sécurisé
- Permissions utilisateur respectées

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Hébergement recommandé

- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Optimisé pour React/Vite
- **GitHub Pages** : Gratuit pour projets open source
- **Firebase Hosting** : Intégration Google

### Configuration serveur

```nginx
# Configuration Nginx pour PWA
location / {
  try_files $uri $uri/ /index.html;
  
  # Headers PWA
  add_header Cache-Control "public, max-age=31536000";
  add_header Service-Worker-Allowed "/";
}

location /sw.js {
  add_header Cache-Control "no-cache";
}
```

## 🤝 Contribution

### Développement

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- ESLint + Prettier configurés
- TypeScript strict mode
- Tests unitaires (Jest + Testing Library)
- Commits conventionnels

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) pour la configuration PWA
- [Workbox](https://developers.google.com/web/tools/workbox) pour le Service Worker
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Lucide](https://lucide.dev/) pour les icônes

---

<div align="center">
  <p>Fait avec ❤️ pour une meilleure gestion financière</p>
  <p>
    <a href="#top">Retour en haut</a> •
    <a href="https://github.com/papiyade/SamaDepense/issues">Signaler un bug</a> •
    <a href="https://github.com/papiyade/SamaDepense/discussions">Discussions</a>
  </p>
</div>

