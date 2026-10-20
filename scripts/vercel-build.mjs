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

// Every production deployment applies only versioned migrations. Account seeding is
// intentionally opt-in because the seed includes a fixed admin username and could
// otherwise replace an existing admin PIN if initial password variables remain set.
if (process.env.VERCEL_ENV === "production" && process.env.DATABASE_URL) {
  run("npx", ["prisma", "migrate", "deploy"]);
  if (process.env.RUN_INITIAL_SEED === "true") {
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "";
    const providerPassword = process.env.INITIAL_PROVIDER_PASSWORD ?? "";
    if (!/^\d{4,12}$/.test(adminPassword)) {
      console.error("RUN_INITIAL_SEED=true requires INITIAL_ADMIN_PASSWORD to be 4–12 digits.");
      process.exit(1);
    }
    if (!/^\d{4,12}$/.test(providerPassword)) {
      console.error("RUN_INITIAL_SEED=true requires INITIAL_PROVIDER_PASSWORD to be 4–12 digits.");
      process.exit(1);
    }
    run("npm", ["run", "db:seed"]);
  } else {
    console.log("RUN_INITIAL_SEED is not true: skipped account seeding to preserve current users and PINs.");
  }
} else if (process.env.VERCEL_ENV === "production") {
  console.warn("DATABASE_URL is missing: skipping production migration and seed.");
}

run("npx", ["next", "build"]);
