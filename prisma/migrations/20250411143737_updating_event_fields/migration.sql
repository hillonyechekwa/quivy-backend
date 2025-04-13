/*
  Warnings:

  - You are about to drop the column `QrCodeValidityDuration` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventEndDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventStartDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `maxParticipants` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `participantId` on the `Winner` table. All the data in the column will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[qrCodeId]` on the table `Winner` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventEndTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventStartTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCodeValidityDuration` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Winner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Winner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Winner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Winner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCodeId` to the `Winner` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_qrCodeId_fkey";

-- DropForeignKey
ALTER TABLE "Winner" DROP CONSTRAINT "Winner_participantId_fkey";

-- DropIndex
DROP INDEX "Winner_participantId_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "QrCodeValidityDuration",
DROP COLUMN "eventEndDate",
DROP COLUMN "eventStartDate",
DROP COLUMN "maxParticipants",
DROP COLUMN "time",
ADD COLUMN     "eventEndTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventStartTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "qrCodeValidityDuration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "fullname" TEXT;

-- AlterTable
ALTER TABLE "Winner" DROP COLUMN "participantId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" INTEGER NOT NULL,
ADD COLUMN     "qrCodeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Participant";

-- CreateIndex
CREATE UNIQUE INDEX "Winner_qrCodeId_key" ON "Winner"("qrCodeId");

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
