/*
  Warnings:

  - You are about to drop the `WorkExperience` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkExperience" DROP CONSTRAINT "WorkExperience_candidate_id_fkey";

-- DropTable
DROP TABLE "WorkExperience";

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_logo_url" TEXT,
    "position" TEXT NOT NULL,
    "descriptions" TEXT[],
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
