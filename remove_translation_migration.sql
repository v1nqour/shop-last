-- Migration Script to Remove French Translation Columns
-- Execute these SQL commands in your PostgreSQL database to remove translation fields

-- 1. Remove French name column from product_families table
ALTER TABLE product_families DROP COLUMN IF EXISTS name_fr;

-- 2. Remove French parameter name column from family_parameters table  
ALTER TABLE family_parameters DROP COLUMN IF EXISTS parameter_name_fr;

-- 3. Remove French value name column from parameter_values table
ALTER TABLE parameter_values DROP COLUMN IF EXISTS value_name_fr;

-- 4. Update the products_with_families view to remove French fields
CREATE OR REPLACE VIEW products_with_families AS
SELECT 
    p.*,
    pf.name as family_name,
    pf.description as family_description
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id;

-- Migration complete: All French translation fields have been removed