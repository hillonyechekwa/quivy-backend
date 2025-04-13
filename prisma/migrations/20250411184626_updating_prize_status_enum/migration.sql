/*
  Warnings:

  - The values [AVALILABLE] on the enum `PrizeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrizeStatus_new" AS ENUM ('AVAILABLE', 'ASSIGNED');
ALTER TABLE "Prize" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Prize" ALTER COLUMN "status" TYPE "PrizeStatus_new" USING ("status"::text::"PrizeStatus_new");
ALTER TYPE "PrizeStatus" RENAME TO "PrizeStatus_old";
ALTER TYPE "PrizeStatus_new" RENAME TO "PrizeStatus";
DROP TYPE "PrizeStatus_old";
ALTER TABLE "Prize" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "Prize" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
