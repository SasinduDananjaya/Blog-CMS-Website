-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "PostCategory" ADD COLUMN     "newStatus" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "newStatus" "Status" NOT NULL DEFAULT 'ACTIVE';
