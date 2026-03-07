/*
  Warnings:

  - You are about to drop the `Recruiter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recruiter" DROP CONSTRAINT "Recruiter_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "Recruiter" DROP CONSTRAINT "Recruiter_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Recruiter" DROP CONSTRAINT "Recruiter_user_id_fkey";

-- DropTable
DROP TABLE "Recruiter";

-- CreateTable
CREATE TABLE "recruiters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "department" TEXT,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_user_id_key" ON "recruiters"("user_id");

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "company_branch_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
