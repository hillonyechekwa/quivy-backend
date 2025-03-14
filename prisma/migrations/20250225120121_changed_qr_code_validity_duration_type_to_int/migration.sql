/*
  Warnings:

  - You are about to drop the column `Duration` on the `Event` table. All the data in the column will be lost.
  - Changed the type of `QrCodeValidityDuration` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "Duration",
DROP COLUMN "QrCodeValidityDuration",
ADD COLUMN     "QrCodeValidityDuration" INTEGER NOT NULL;
