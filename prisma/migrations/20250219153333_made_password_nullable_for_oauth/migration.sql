-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
