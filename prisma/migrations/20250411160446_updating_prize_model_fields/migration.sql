-- DropIndex
DROP INDEX "Prize_eventId_key";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "uniqueCode" DROP NOT NULL;
