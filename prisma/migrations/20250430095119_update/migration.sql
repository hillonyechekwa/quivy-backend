-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "clicks" DROP NOT NULL,
ALTER COLUMN "clicks" SET DEFAULT 0,
ALTER COLUMN "scans" DROP NOT NULL,
ALTER COLUMN "scans" SET DEFAULT 0;
