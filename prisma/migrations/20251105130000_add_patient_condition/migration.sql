-- Ensure Patient.condition column exists and has default
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Patient' AND column_name = 'condition'
  ) THEN
    ALTER TABLE "Patient" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'N/A';
  END IF;
END $$;


