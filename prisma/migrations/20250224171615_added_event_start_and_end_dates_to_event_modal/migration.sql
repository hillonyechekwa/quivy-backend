/*
  Warnings:

  - Added the required column `eventEndDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventStartDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `QrCodeValidityDuration` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventStartDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "QrCodeValidityDuration",
ADD COLUMN     "QrCodeValidityDuration" TIMESTAMP(3) NOT NULL;
