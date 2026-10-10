import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.error) {
    console.error(`Could not run ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "generate"]);

// Keep previews safe. Production initializes its schema and first accounts
// only after a PostgreSQL DATABASE_URL has been attached to the Vercel project.
if (process.env.VERCEL_ENV === "production" && process.env.DATABASE_URL) {
  run("npx", ["prisma", "migrate", "deploy"]);
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "";
  const providerPassword = process.env.INITIAL_PROVIDER_PASSWORD ?? "";
  if (adminPassword.length >= 6 && providerPassword.length >= 8) {
    run("npm", ["run", "db:seed"]);
  } else {
    console.warn("Initial admin/provider password environment variables are missing or too short: skipping seed. Set INITIAL_ADMIN_PASSWORD (6+ chars) and INITIAL_PROVIDER_PASSWORD (8+ chars) in Vercel, then redeploy.");
  }
} else if (process.env.VERCEL_ENV === "production") {
  console.warn("DATABASE_URL is missing: skipping production migration and seed.");
}

run("npx", ["next", "build"]);
