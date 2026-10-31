-- AddForeignKey
ALTER TABLE "PublicSpeakingOccasion" ADD CONSTRAINT "PublicSpeakingOccasion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
