# TG Installations Maroc

Application web mobile-first pour piloter les installations de Têtes de Gondole (TG) dans les magasins au Maroc.

## Fonctionnalités

- Connexion simple par rôle : **Admin (PIN)** ou **Prestataire (nom dans une liste + PIN)**.
- Vérification du rôle et du PIN côté serveur, session HTTP-only signée et expiration après 12 heures.
- Dashboard admin : suivi des statuts, recherche et filtre par ville, affectations, fiches techniques PDF, gestion des comptes et changement de codes.
- Espace mobile prestataire : magasins affectés, fiche magasin et lien vers le PDF technique.
- Mesures Face, Fronton, Plinthe et Côtés.
- Upload de photos JPG/PNG/WebP vers Vercel Blob, limite de 5 photos par magasin et 10 Mo par photo.
- Fin d'installation conditionnée par les mesures sauvegardées et au moins 3 photos.
- Sept prestataires initiaux et les magasins de la matrice fournie. Les PIN sont stockés sous forme de hash bcrypt.

## Stack

Next.js App Router, TypeScript, React, PostgreSQL, Prisma 6, Tailwind CSS 4, sessions signées `jose`, bcrypt et Vercel Blob.

## Dépôt

Dépôt source : https://github.com/abdelhamidanachad-wq/kroon-tg-instalation

Ne jamais committer de fichier `.env`, PIN, mot de passe, ni jeton.

## Configuration requise avant utilisation

Dans Vercel > projet > Settings > Environment Variables, vérifiez que les variables suivantes sont renseignées pour l'environnement **Production** :

- `DATABASE_URL` : connexion PostgreSQL.
- `SESSION_SECRET` : secret aléatoire d'au moins 32 caractères.
- `INITIAL_ADMIN_PASSWORD` : PIN initial de l'Admin, au moins 4 chiffres si l'interface PIN est utilisée.
- `INITIAL_PROVIDER_PASSWORD` : PIN initial partagé des prestataires, au moins 4 chiffres si l'interface PIN est utilisée.
- `BLOB_READ_WRITE_TOKEN` : nécessaire pour enregistrer les photos; connecter un store Vercel Blob peut l'injecter automatiquement.

Les deux variables initiales de mot de passe ne servent qu'au seed initial. Le seed n'écrase pas les identifiants déjà existants et n'est pas un mécanisme de réinitialisation des PIN existants. Ne relancez pas le seed sur la production juste pour modifier un PIN sans vérifier d'abord l'effet sur les données et les comptes.

Le système vérifie le PIN soumis contre le hash bcrypt du compte. Une liste prestataire vide signifie que la base ou le seed des comptes n'est pas prêt.

## Déploiement Vercel

Le dépôt est lié à un projet Vercel nommé `kroon-tg-instalation-vofd`. Les pushes sur `main` déclenchent un déploiement automatique.

**Important pour le partage d'équipe :** le projet Vercel doit permettre l'accès aux membres de l'équipe qui ne sont pas connectés à votre compte Vercel. Vérifiez **Settings > Deployment Protection**. Désactivez Vercel Authentication/SSO pour les environnements utilisés par l'équipe, ou utilisez un domaine de production personnalisé exempt de cette protection. Ne partagez pas un lien de contournement temporaire comme URL de production.

## Utilisation après configuration

1. Ouvrir l'URL de production du projet.
2. Sélectionner **Admin** et saisir le PIN Admin, ou sélectionner **Prestataire**, choisir son nom et saisir le PIN prestataire.
3. L'Admin peut gérer les comptes et changer les mots de passe/PINs depuis le tableau de bord.
4. Les prestataires ne voient que leurs magasins affectés.

## Sécurité / mise en production

- Utiliser des PIN difficiles à deviner et distincts pour Admin et Prestataires.
- Prévoir une limitation des tentatives de connexion si l'application est utilisée à plus grande échelle.
- Garder le dépôt privé si les données opérationnelles et les affectations doivent rester confidentielles.
- Vérifier les sauvegardes PostgreSQL et les droits d'accès aux URL des photos.
- Les URL PDF sont issues de la matrice et certaines peuvent être absentes.
