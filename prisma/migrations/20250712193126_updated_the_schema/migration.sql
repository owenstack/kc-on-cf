/*
  Warnings:

  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_referrer_id_fkey";

-- DropTable
DROP TABLE "subscription";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
