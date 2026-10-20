CREATE TYPE "InstallationType" AS ENUM ('TG', 'STAND');
ALTER TABLE "Installation" ADD COLUMN "installationType" "InstallationType" NOT NULL DEFAULT 'TG';
ALTER TABLE "Installation" ADD COLUMN "photoProofs" JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX "Installation_type_status_idx" ON "Installation"("installationType", "status");
