-- The live school database was verified to contain no transport records before
-- applying this ownership migration. New records are therefore never global.
ALTER TABLE "Depot" ADD COLUMN "schoolId" INTEGER NOT NULL;
ALTER TABLE "Depot" ADD COLUMN "branchId" INTEGER NOT NULL;
ALTER TABLE "FleetVehicle" ADD COLUMN "schoolId" INTEGER NOT NULL;
ALTER TABLE "FleetVehicle" ADD COLUMN "branchId" INTEGER NOT NULL;

CREATE UNIQUE INDEX "Depot_schoolId_branchId_name_key" ON "Depot"("schoolId", "branchId", "name");
CREATE INDEX "Depot_schoolId_branchId_idx" ON "Depot"("schoolId", "branchId");
CREATE INDEX "FleetVehicle_schoolId_branchId_idx" ON "FleetVehicle"("schoolId", "branchId");

ALTER TABLE "Depot" ADD CONSTRAINT "Depot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
