-- Normalize bilingual fields for core lookup tables in Postgres
-- Ensure Arabic values exist; if missing, copy from English

BEGIN;

-- Lookups: set ValueAr to Value when missing or empty
UPDATE "Lookups"
SET "ValueAr" = "Value"
WHERE "ValueAr" IS NULL OR "ValueAr" = '';

-- ProjectCategories: keep the canonical category master bilingual
UPDATE "ProjectCategories"
SET "NameAr" = "NameEn"
WHERE "NameAr" IS NULL OR "NameAr" = '';

-- ClientStatuses: set NameAr to NameEn when missing or empty
UPDATE "ClientStatuses"
SET "NameAr" = "NameEn"
WHERE "NameAr" IS NULL OR "NameAr" = '';

COMMIT;
