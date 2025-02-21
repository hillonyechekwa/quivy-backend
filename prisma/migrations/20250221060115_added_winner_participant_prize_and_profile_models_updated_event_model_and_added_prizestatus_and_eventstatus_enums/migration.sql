/*
  Warnings:

  - A unique constraint covering the columns `[uniqueCode]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Duration` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueCode` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFTED', 'UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('AVALILABLE', 'ASSIGNED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "Duration" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uniqueCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "phoneNumber" INTEGER,
    "name" TEXT,
    "address" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "PrizeStatus" NOT NULL DEFAULT 'AVALILABLE',
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantId" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_key" ON "Participant"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Prize_eventId_key" ON "Prize"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_eventId_key" ON "Winner"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_participantId_key" ON "Winner"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_prizeId_key" ON "Winner"("prizeId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_uniqueCode_key" ON "Event"("uniqueCode");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
