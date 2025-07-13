/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_referrer_id_fkey";

-- DropForeignKey
ALTER TABLE "user_booster" DROP CONSTRAINT "user_booster_userId_fkey";

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "telegram_id" SET DATA TYPE BIGINT,
ALTER COLUMN "referrer_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AlterTable
ALTER TABLE "user_booster" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_booster" ADD CONSTRAINT "user_booster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
