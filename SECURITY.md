# Security Notes

- Keep the GitHub repository private because it includes operational assignments and store metadata.
- Never commit `.env`, access tokens, database connection strings, or actual passwords.
- Initial passwords must be passed to `prisma/seed.ts` through environment variables and are hashed by bcrypt before storage.
- Configure a long random `SESSION_SECRET` (32+ characters) in every environment.
- Vercel Blob photo URLs use public access. Do not use public photo storage if store images must be confidential; switch to private storage with authenticated download routes.
- Add persistent login rate limiting before exposing the login endpoint broadly.
