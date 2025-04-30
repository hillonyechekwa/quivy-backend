/*
  Warnings:

  - The values [COMPLETED] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `qrCodeId` on the `Winner` table. All the data in the column will be lost.
  - You are about to drop the `QrCode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clicks` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCodeUrl` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scans` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFTED', 'UPCOMING', 'ACTIVE', 'CLOSED');
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "EventStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "QrCode" DROP CONSTRAINT "QrCode_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Winner" DROP CONSTRAINT "Winner_qrCodeId_fkey";

-- DropIndex
DROP INDEX "Winner_qrCodeId_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "clicks" INTEGER NOT NULL,
ADD COLUMN     "qrCodeUrl" TEXT NOT NULL,
ADD COLUMN     "scans" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Winner" DROP COLUMN "qrCodeId";

-- DropTable
DROP TABLE "QrCode";
