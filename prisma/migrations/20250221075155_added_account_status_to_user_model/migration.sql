/*
  Warnings:

  - Added the required column `qrCodeId` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "QrCodeValidityDuration" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "qrCodeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_code_key" ON "QrCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_eventId_key" ON "QrCode"("eventId");

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
