-- AddForeignKey
ALTER TABLE "employee_attendance_logs_user_links" ADD CONSTRAINT "employee_attendance_logs_user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
