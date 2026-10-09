# TG Installations Maroc

Application web mobile-first pour piloter les installations de Têtes de Gondole (TG) dans les magasins au Maroc.

## Fonctionnalités livrées dans ce starter

- Login identifiant + mot de passe sans email, avec cookie de session HTTP-only signé et expiration après 12 heures.
- Rôles Admin / Prestataire, vérifiés côté serveur pour les pages et les API.
- Dashboard admin : progression par statut, recherche et filtre ville, affectation du prestataire, consultation des fiches techniques PDF, gestion des comptes et changement de mot de passe.
- Espace mobile prestataire : liste des magasins affectés, fiche magasin et lien vers le PDF technique.
- Formulaire de mesures Face, Fronton, Plinthe et Côtés, stocké dans `Installation.measurements` au format JSON.
- Upload de photos JPG/PNG/WebP vers Vercel Blob, limite 5 photos / magasin et 10 Mo / photo.
- Validation de fin d’installation conditionnée par des mesures sauvegardées et au moins 3 photos.
- Seed des 7 prestataires initiaux et des 30 magasins de la matrice fournie. Les mots de passe sont hachés avec bcrypt et ne sont pas enregistrés en clair dans le code.

## Stack

- Next.js App Router + TypeScript + React
- PostgreSQL + Prisma 6
- Tailwind CSS 4
- Sessions JWT signées (`jose`)
- bcrypt pour les mots de passe
- Vercel Blob pour les photos

## Arborescence

```text
app/
  api/
    auth/login/route.ts
    auth/logout/route.ts
    admin/users/route.ts
    admin/users/[id]/route.ts
    admin/installations/[id]/route.ts
    installations/[id]/route.ts
    installations/[id]/photos/route.ts
  admin/page.tsx
  admin/admin-client.tsx
  login/page.tsx
  stores/page.tsx
  stores/logout-button.tsx
  stores/[id]/page.tsx
  stores/[id]/store-client.tsx
  globals.css
  layout.tsx
  page.tsx
lib/
  auth.ts
  prisma.ts
  status.ts
prisma/
  schema.prisma
  migrations/20261009000000_init/migration.sql
  migrations/migration_lock.toml
  seed.ts
.env.example
package.json
```

## Déploiement

### 1. Créer un dépôt GitHub

Créer un nouveau dépôt nommé `tg-installations-maroc` sous votre compte GitHub. Gardez-le **privé** : la matrice contient des affectations de prestataires et des informations opérationnelles.

Extraire ce ZIP, puis pousser son contenu à la racine du nouveau dépôt. Ne poussez jamais le fichier `.env`.

### 2. Créer PostgreSQL et Blob

Dans Vercel, créez une base PostgreSQL (ou utilisez une base PostgreSQL compatible) et copiez la chaîne de connexion dans `DATABASE_URL`. Créez/connectez aussi un store Vercel Blob au projet pour que `BLOB_READ_WRITE_TOKEN` soit injecté. Le stockage photo reste désactivé tant que le token n’est pas configuré.

### 3. Configurer les variables

Copiez `.env.example` vers `.env` en développement. Pour le seed initial, utilisez les identifiants demandés par le propriétaire via les variables locales suivantes, sans les committer :

```dotenv
INITIAL_ADMIN_PASSWORD="<mot-de-passe-initial-admin>"
INITIAL_PROVIDER_PASSWORD="<mot-de-passe-initial-prestataires>"
```

`INITIAL_ADMIN_PASSWORD` accepte au moins 6 caractères pour correspondre au mot de passe initial demandé. Changez-le après la première connexion. Les nouveaux mots de passe prestataire créés depuis le dashboard doivent comporter au moins 8 caractères.

Ajoutez `DATABASE_URL` et `SESSION_SECRET` (secret aléatoire de 32 caractères minimum) à Vercel pour Production, Preview et Development. Ajoutez également `BLOB_READ_WRITE_TOKEN` ou liez le store Blob.

### 4. Installer, migrer et seed

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Pour exécuter le seed en local, les trois variables suivantes doivent être disponibles : `DATABASE_URL`, `INITIAL_ADMIN_PASSWORD`, `INITIAL_PROVIDER_PASSWORD`. Le seed est idempotent et crée/actualise les comptes et les 30 magasins. Une réexécution ne réinitialise pas les mots de passe déjà modifiés.

## Comptes initiaux

- `admin` — mot de passe fourni par `INITIAL_ADMIN_PASSWORD`
- `issam_agadir`
- `hicham_marrakech`
- `adil_rabat`
- `adil_tanger`
- `adil_fes`
- `zouhair_kenitra`
- `interface_casa` — affectations Casablanca, Mohammedia, El Jadida et Berrechid

Tous les prestataires initiaux utilisent `INITIAL_PROVIDER_PASSWORD` au moment du seed. Chaque hash enregistré en base est calculé par bcrypt.

## Notes de production importantes

- Le dépôt doit être privé et les secrets doivent rester dans les variables d’environnement.
- Il s’agit d’un starter de déploiement : la création du projet Vercel, la liaison au nouveau dépôt, la connexion PostgreSQL/Blob et l’exécution du seed doivent être terminées dans les comptes hébergeurs avant qu’il soit pleinement opérationnel.
- Prévoir avant une ouverture large : limitation de tentatives de login, rotation obligatoire du mot de passe admin initial, sauvegardes PostgreSQL et vérification des droits d’accès aux URL photo publiques.
- Les dates et URL PDF ont été reprises de la matrice fournie. Certaines fiches n’avaient pas d’URL dans les informations sources et apparaîtront comme « Non fournie ».
