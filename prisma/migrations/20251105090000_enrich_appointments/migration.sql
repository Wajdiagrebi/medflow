-- Create enum for appointment status
DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'DONE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns with temporary defaults for backfill
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "endTime"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "reason"     TEXT;

-- Convert status from text to enum with safe mapping
ALTER TABLE "Appointment"
  ALTER COLUMN "status" TYPE "AppointmentStatus"
  USING (
    CASE
      WHEN "status" IN ('SCHEDULED','CANCELLED','DONE') THEN "status"::"AppointmentStatus"
      ELSE 'SCHEDULED'::"AppointmentStatus"
    END
  );

-- Backfill start/end from legacy date column if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Appointment' AND column_name = 'date'
  ) THEN
    UPDATE "Appointment"
    SET "startTime" = "date",
        "endTime"   = "date" + INTERVAL '30 minutes'
    WHERE "date" IS NOT NULL; -- skip rows without legacy date
  END IF;
END $$;

-- Drop legacy date column if exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Appointment' AND column_name = 'date'
  ) THEN
    ALTER TABLE "Appointment" DROP COLUMN "date";
  END IF;
END $$;

-- Indexes for queries
CREATE INDEX IF NOT EXISTS "Appointment_doctor_start_end_idx"
  ON "Appointment" ("doctorId", "startTime", "endTime");
CREATE INDEX IF NOT EXISTS "Appointment_patient_start_idx"
  ON "Appointment" ("patientId", "startTime");

-- Ensure Patient.condition has default and no nulls
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Patient' AND column_name = 'condition'
  ) THEN
    ALTER TABLE "Patient" ALTER COLUMN "condition" SET DEFAULT 'N/A';
    UPDATE "Patient" SET "condition" = 'N/A' WHERE "condition" IS NULL;
  END IF;
END $$;

