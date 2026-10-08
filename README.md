# EventHub

Application web de gestion d'événements et d'inscriptions, développée dans le cadre d'un test technique.

EventHub permet aux administrateurs et aux membres du staff de gérer les événements, les participants et leurs inscriptions, avec un dashboard présentant les principales statistiques.

## 🎥 Démonstration

### Démo complète de l'application

<img width="800" height="450" alt="eventhub-app" src="https://github.com/user-attachments/assets/0709c8fc-48f8-43ac-b2f2-3cef1d93b8f4" />



> Le GIF présente les principales fonctionnalités de l'application : authentification, dashboard, gestion des événements, participants et inscriptions.



https://github.com/user-attachments/assets/f1d24018-84b7-40d9-bc1a-5fff7840d308



---

## ✨ Fonctionnalités

### 🔐 Authentification & rôles

* Authentification sécurisée avec JWT
* Hashage des mots de passe avec bcrypt
* Deux rôles :

  * **Admin** — accès complet à l'application, y compris la gestion des utilisateurs
  * **Staff** — gestion des événements et des inscriptions
* Protection des routes selon le rôle de l'utilisateur

| Fonctionnalité                 | Admin | Staff |
| ------------------------------ | :---: | :---: |
| Dashboard                      |   ✅   |   ✅   |
| Consulter les événements       |   ✅   |   ✅   |
| Créer / modifier un événement  |   ✅   |   ✅   |
| Publier / annuler un événement |   ✅   |   ✅   |
| Gestion des participants       |   ✅   |   ✅   |
| Gestion des inscriptions       |   ✅   |   ✅   |
| Gestion des utilisateurs       |   ✅   |   ❌   |

### 🔑 Comptes de démonstration

**Admin**

```text
Email    : admin@eventhub.local
Password : admin123
```

**Staff**

```text
Email    : staff@eventhub.local
Password : staff123
```


### 📅 Gestion des événements

* Création d'événements
* Modification des événements
* Publication d'un événement
* Annulation d'un événement
* Filtrage par statut
* Consultation des détails d'un événement
* Gestion du nombre maximum de participants

Statuts disponibles :

* `draft`
* `published`
* `cancelled`

### 👥 Gestion des participants

* Création et modification des participants
* Recherche par nom ou adresse email
* Email unique par participant
* Consultation des informations des participants

### 📝 Gestion des inscriptions

* Inscription d'un participant à un événement
* Gestion des statuts :

  * `pending`
  * `confirmed`
  * `cancelled`
* Impossible de s'inscrire à un événement non publié
* Impossible d'inscrire deux fois le même participant au même événement
* Blocage des inscriptions lorsque la capacité maximale est atteinte
* Annulation automatique des inscriptions lorsqu'un événement est annulé

### 📊 Dashboard

Le dashboard présente notamment :

* Nombre total d'événements
* Nombre d'événements publiés
* Nombre d'inscriptions du jour
* Top 5 des événements les plus remplis

---

## 🛠️ Stack technique

### Frontend

* React
* Vite
* TypeScript
* TanStack React Query
* Tailwind CSS

### Backend

* Node.js
* Express
* JWT
* bcrypt
* Zod
* REST API

### Base de données

* PostgreSQL 18
* UUID
* Contraintes `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE` et `CHECK`
* Index pour les recherches et performances

---

## 🏗️ Architecture

```text
EventHub
│
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── ...
│   └── ...
│
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scripts/
│   │   └── ...
│   ├── schema.sql
│   └── ...
│
└── docs/
    └── demo.gif
```

---

## 🗄️ Modèle de données

Le modèle repose sur quatre tables principales :

```text
users
  │
  │ 1:N
  ▼
events
  │
  │ 1:N
  ▼
registrations
  ▲
  │ N:1
  │
participants
```

### Tables principales

| Table           | Description                                   |
| --------------- | --------------------------------------------- |
| `users`         | Utilisateurs de l'application et leurs rôles  |
| `events`        | Événements créés dans l'application           |
| `participants`  | Participants disponibles                      |
| `registrations` | Associations entre participants et événements |

Les inscriptions utilisent une contrainte unique sur :

```text
(event_id, participant_id)
```

afin d'empêcher une double inscription au même événement.

---

## 🚀 Installation

### Prérequis

* Node.js
* npm
* PostgreSQL 18

### 1. Cloner le projet

```bash
git clone https://github.com/Abdelouahed09/Eventhub.git
cd Eventhub
```

### 2. Installer les dépendances

Frontend :

```bash
cd client
npm install
```

Backend :

```bash
cd ../server
npm install
```

### 3. Configurer PostgreSQL

Créer une base de données PostgreSQL nommée :

```text
eventhub
```

Puis configurer le fichier :

```text
server/.env
```

Exemple :

```env
PORT=5000

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5433/eventhub

JWT_SECRET=change_this_secret_in_production
JWT_EXPIRES_IN=1d

NODE_ENV=development
```

> Le port PostgreSQL dépend de votre installation. Dans mon environnement local, PostgreSQL 18 utilise le port `5433`.

### 4. Initialiser la base de données

Depuis le dossier `server` :

```bash
npm run db:setup
```

Cette commande crée :

* les tables
* les contraintes
* les index
* les données de test

---

## ▶️ Lancer l'application

### Backend

Depuis `server/` :

```bash
npm run dev
```

Le serveur démarre sur :

```text
http://localhost:5000
```

Health check :

```text
GET /api/health
```

### Frontend

Depuis `client/` :

```bash
npm run dev
```

Puis ouvrir l'URL affichée par Vite, généralement :

```text
http://localhost:5173
```

---

## 🔑 Comptes de démonstration

Deux comptes sont disponibles pour tester les différents niveaux d'accès.

### Administrateur

```text
Email    : admin@eventhub.local
Password : admin123
Rôle     : admin
```

### Staff

```text
Email    : staff@eventhub.local
Password : staff123
Rôle     : staff
```

---

## 🧪 Données de test

La base de données est initialisée avec :

* **2 utilisateurs**

  * 1 admin
  * 1 staff
* **3 événements**
* **10 participants**
* **20 inscriptions**

Les événements couvrent les différents statuts :

```text
draft
published
cancelled
```

Les inscriptions utilisent également :

```text
pending
confirmed
cancelled
```

---

## 🔌 API REST

### Authentification

```http
POST /api/auth/login
GET  /api/auth/me
```

### Événements

```http
POST   /api/events
GET    /api/events
GET    /api/events/:id
PUT    /api/events/:id
PATCH  /api/events/:id/status
```

### Participants

```http
POST /api/participants
GET  /api/participants
PUT  /api/participants/:id
```

### Inscriptions

```http
POST  /api/registrations
GET   /api/registrations
PATCH /api/registrations/:id/status
```

---

## 🔒 Règles métier principales

L'application applique notamment les règles suivantes :

1. Un événement doit être **publié** pour permettre une inscription.
2. Un participant ne peut pas être inscrit deux fois au même événement.
3. Le nombre d'inscriptions ne peut pas dépasser `maxParticipants`.
4. L'annulation d'un événement entraîne l'annulation de ses inscriptions.
5. Les endpoints protégés nécessitent une authentification JWT.
6. Les opérations disponibles dépendent du rôle de l'utilisateur.

---

## 📁 Variables d'environnement

Le fichier `.env` ne doit pas être commité dans Git.

Exemple :

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5433/eventhub
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

Ajouter au `.gitignore` :

```text
.env
node_modules/
```

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre d'un test technique — **EventHub : Gestion d'Événements & Inscriptions**.
