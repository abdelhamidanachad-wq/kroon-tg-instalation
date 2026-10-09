CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROVIDER');
CREATE TYPE "InstallationStatus" AS ENUM ('A_REPERER', 'MESURES_PRISES', 'PROD', 'DISPATCH', 'INSTALLE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'PROVIDER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_role_active_idx" ON "User"("role", "active");

CREATE TABLE "Installation" (
  "id" TEXT NOT NULL,
  "banner" TEXT NOT NULL,
  "storeName" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "supervisor" TEXT,
  "phone" TEXT,
  "status" "InstallationStatus" NOT NULL DEFAULT 'A_REPERER',
  "techSheetUrl" TEXT,
  "deadline" TIMESTAMP(3),
  "measurements" JSONB,
  "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "providerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Installation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Installation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Installation_banner_storeName_city_key" ON "Installation"("banner", "storeName", "city");
CREATE INDEX "Installation_providerId_status_idx" ON "Installation"("providerId", "status");
CREATE INDEX "Installation_city_status_idx" ON "Installation"("city", "status");
