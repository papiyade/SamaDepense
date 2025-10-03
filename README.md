# 💰 SamaDepense - Gestion Financière Personnelle

Une application PWA moderne et intuitive pour la gestion des finances personnelles, conçue spécialement pour les utilisateurs francophones d'Afrique de l'Ouest.

![SamaDepense](https://img.shields.io/badge/Version-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![Offline](https://img.shields.io/badge/Offline-Support-orange)

## ✨ Fonctionnalités

### 🏠 **Dashboard Intelligent**
- Aperçu en temps réel de votre situation financière
- Graphiques interactifs et statistiques détaillées
- Indicateurs de progression et tendances

### 💳 **Gestion des Transactions**
- Ajout rapide de revenus et dépenses
- Catégorisation automatique et manuelle
- Recherche et filtrage avancés
- Transactions récurrentes

### 🎯 **Épargne Multi-Objectifs**
- Création de "boxes" d'épargne personnalisées
- Suivi de progression avec indicateurs visuels
- Objectifs avec échéances et milestones
- Transferts automatiques

### 📊 **Analytics Avancées**
- Graphiques en secteurs et barres interactifs
- Analyse des habitudes de dépenses
- Rapports mensuels et annuels
- Conseils personnalisés basés sur l'IA

### 🎮 **Gamification**
- Système de niveaux et XP
- Badges et achievements
- Défis financiers
- Motivation par la progression

### 🌐 **PWA Complète**
- Fonctionnement 100% hors ligne
- Installation sur mobile et desktop
- Synchronisation automatique
- Notifications push

## 🛠️ Stack Technique

### **Frontend**
- **React 18** - Interface utilisateur moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides

### **État et Données**
- **Zustand** - Gestion d'état légère et performante
- **IndexedDB** - Stockage local via Dexie.js
- **React Router** - Navigation côté client

### **PWA et Offline**
- **Vite PWA Plugin** - Configuration PWA automatique
- **Service Workers** - Cache et synchronisation
- **Web App Manifest** - Installation native

### **UI/UX**
- **Lucide React** - Icônes modernes et cohérentes
- **Recharts** - Graphiques interactifs
- **Design System** - Composants réutilisables

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js 18+ 
- npm ou yarn

### **Installation**
```bash
# Cloner le repository
git clone https://github.com/papiyade/SamaDepense.git
cd SamaDepense

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

### **Déploiement PWA**
```bash
# Build optimisé pour PWA
npm run build

# Les fichiers sont générés dans le dossier 'dist'
# Déployez sur votre serveur web préféré
```

## 📱 Utilisation

### **Premier Démarrage**
1. **Onboarding** - Configuration initiale guidée
2. **Solde Initial** - Définition de votre situation financière
3. **Catégories** - Personnalisation des catégories de dépenses
4. **Premier Objectif** - Création de votre première épargne

### **Utilisation Quotidienne**
1. **Ajout de Transactions** - Enregistrement rapide des dépenses/revenus
2. **Suivi des Objectifs** - Vérification de la progression
3. **Consultation du Dashboard** - Vue d'ensemble de vos finances
4. **Analytics** - Analyse de vos habitudes financières

### **Fonctionnalités Avancées**
- **Export/Import** - Sauvegarde et restauration des données
- **Thèmes** - Mode sombre/clair/système
- **Notifications** - Alertes personnalisées
- **Gamification** - Progression et achievements

## 🎨 Design et UX

### **Principes de Design**
- **Mobile-First** - Optimisé pour les smartphones
- **Minimalisme** - Interface claire et épurée
- **Accessibilité** - Conforme aux standards WCAG
- **Performance** - Chargement rapide et fluidité

### **Palette de Couleurs**
- **Primaire** - Bleu ciel (#0ea5e9) - Confiance et stabilité
- **Succès** - Vert (#22c55e) - Croissance et épargne
- **Attention** - Ambre (#f59e0b) - Alertes et notifications
- **Danger** - Rouge (#ef4444) - Dépenses et alertes critiques

### **Typographie**
- **Police** - Inter (Google Fonts)
- **Hiérarchie** - Système cohérent de tailles et poids
- **Lisibilité** - Contraste optimisé pour tous les écrans

## 🔧 Configuration

### **Variables d'Environnement**
```env
# Optionnel - pour les fonctionnalités futures
VITE_API_URL=https://api.samadepense.com
VITE_ANALYTICS_ID=your-analytics-id
```

### **Personnalisation**
- **Thèmes** - Modification des couleurs dans `tailwind.config.js`
- **Composants** - Système de design modulaire
- **Langues** - Support multilingue (FR, EN, WO)

## 📊 Architecture

### **Structure des Dossiers**
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants de base (Button, Card, etc.)
│   ├── layout/         # Layout et navigation
│   ├── dashboard/      # Composants du dashboard
│   ├── transactions/   # Gestion des transactions
│   ├── savings/        # Épargne et objectifs
│   └── gamification/   # Éléments de gamification
├── pages/              # Pages principales
├── stores/             # Gestion d'état Zustand
├── services/           # Services (database, storage)
├── types/              # Types TypeScript
├── utils/              # Utilitaires
├── hooks/              # Hooks personnalisés
└── styles/             # Styles globaux
```

### **Gestion des Données**
- **Local-First** - Toutes les données stockées localement
- **IndexedDB** - Base de données navigateur performante
- **Synchronisation** - Préparé pour sync cloud future
- **Backup** - Export/import des données utilisateur

## 🔒 Sécurité et Confidentialité

### **Données Personnelles**
- **Stockage Local** - Aucune donnée envoyée sur internet
- **Chiffrement** - Données sensibles chiffrées localement
- **Anonymisation** - Pas de tracking utilisateur
- **RGPD Compliant** - Respect de la vie privée

### **Sécurité Technique**
- **CSP** - Content Security Policy stricte
- **HTTPS** - Chiffrement des communications
- **Service Workers** - Cache sécurisé
- **Validation** - Validation côté client et serveur

## 🌍 Internationalisation

### **Langues Supportées**
- **Français** - Langue principale
- **Anglais** - Support international
- **Wolof** - Langue locale (Sénégal)

### **Localisation**
- **Devises** - Support multi-devises (CFA, EUR, USD)
- **Formats** - Dates et nombres localisés
- **Culture** - Adaptation aux habitudes locales

## 🤝 Contribution

### **Comment Contribuer**
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### **Guidelines**
- **Code Style** - ESLint et Prettier configurés
- **Tests** - Tests unitaires requis pour les nouvelles fonctionnalités
- **Documentation** - Documenter les nouvelles APIs
- **Accessibilité** - Respecter les standards WCAG

## 📝 Roadmap

### **Version 1.1** (Q1 2024)
- [ ] Synchronisation cloud
- [ ] Partage familial
- [ ] Budgets avancés
- [ ] Notifications push

### **Version 1.2** (Q2 2024)
- [ ] Mode multi-utilisateur
- [ ] Intégration bancaire
- [ ] IA pour conseils financiers
- [ ] Marketplace de thèmes

### **Version 2.0** (Q3 2024)
- [ ] Version desktop native
- [ ] API publique
- [ ] Plugins tiers
- [ ] Communauté intégrée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal** - [@papiyade](https://github.com/papiyade)
- **Design UX/UI** - Équipe SamaDepense
- **Tests et QA** - Communauté

## 📞 Support

### **Aide et Documentation**
- **Wiki** - [Documentation complète](https://github.com/papiyade/SamaDepense/wiki)
- **FAQ** - [Questions fréquentes](https://github.com/papiyade/SamaDepense/wiki/FAQ)
- **Issues** - [Signaler un bug](https://github.com/papiyade/SamaDepense/issues)

### **Contact**
- **Email** - support@samadepense.com
- **Twitter** - [@SamaDepense](https://twitter.com/SamaDepense)
- **Discord** - [Communauté SamaDepense](https://discord.gg/samadepense)

---

<div align="center">

**Fait avec ❤️ pour la communauté francophone d'Afrique de l'Ouest**

[🌟 Star ce projet](https://github.com/papiyade/SamaDepense) • [🐛 Signaler un bug](https://github.com/papiyade/SamaDepense/issues) • [💡 Suggérer une fonctionnalité](https://github.com/papiyade/SamaDepense/issues)

</div>

