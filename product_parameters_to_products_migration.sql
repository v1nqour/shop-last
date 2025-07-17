-- Migration script to convert family-based parameters to product-based parameters
-- This script will create new tables and migrate existing data

-- Create new product_parameters table (parameters directly linked to products)
CREATE TABLE IF NOT EXISTS product_parameters (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    parameter_type VARCHAR(50) NOT NULL DEFAULT 'dropdown',
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new product_parameter_values table (values for each product parameter)
CREATE TABLE IF NOT EXISTS product_parameter_values (
    id SERIAL PRIMARY KEY,
    product_parameter_id INTEGER NOT NULL REFERENCES product_parameters(id) ON DELETE CASCADE,
    value_name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new product_parameter_selections table (user selections for each product)
CREATE TABLE IF NOT EXISTS product_parameter_selections (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_parameter_id INTEGER NOT NULL REFERENCES product_parameters(id) ON DELETE CASCADE,
    selected_values TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, product_parameter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_parameters_product_id ON product_parameters(product_id);
CREATE INDEX IF NOT EXISTS idx_product_parameter_values_parameter_id ON product_parameter_values(product_parameter_id);
CREATE INDEX IF NOT EXISTS idx_product_parameter_selections_product_id ON product_parameter_selections(product_id);

-- Migrate existing family parameters to product parameters
-- For each product in a family, create corresponding product parameters
INSERT INTO product_parameters (product_id, parameter_name, parameter_type, is_required, display_order)
SELECT 
    p.id::VARCHAR(255) as product_id,
    fp.parameter_name,
    fp.parameter_type,
    fp.is_required,
    fp.display_order
FROM products p
JOIN family_parameters fp ON p.family_id = fp.family_id
WHERE p.family_id IS NOT NULL;

-- Migrate parameter values to product parameter values
INSERT INTO product_parameter_values (product_parameter_id, value_name, display_order)
SELECT 
    pp.id as product_parameter_id,
    pv.value_name,
    pv.display_order
FROM product_parameters pp
JOIN products p ON pp.product_id = p.id::VARCHAR(255)
JOIN family_parameters fp ON p.family_id = fp.family_id AND pp.parameter_name = fp.parameter_name
JOIN parameter_values pv ON fp.id = pv.parameter_id;

-- Migrate existing product parameter selections to the new structure
INSERT INTO product_parameter_selections (product_id, product_parameter_id, selected_values)
SELECT 
    pps.product_id,
    pp.id as product_parameter_id,
    pps.selected_values
FROM product_parameter_selections_old pps
JOIN product_parameters pp ON pps.product_id = pp.product_id
JOIN family_parameters fp ON pps.parameter_id = fp.id AND pp.parameter_name = fp.parameter_name
WHERE EXISTS (
    SELECT 1 FROM product_parameter_selections_old
    WHERE product_id = pps.product_id AND parameter_id = pps.parameter_id
);

-- Rename old table to preserve data (optional - remove if you want to drop completely)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_parameter_selections') THEN
        ALTER TABLE product_parameter_selections RENAME TO product_parameter_selections_old;
    END IF;
END $$;

-- Recreate the new product_parameter_selections table
CREATE TABLE product_parameter_selections (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_parameter_id INTEGER NOT NULL REFERENCES product_parameters(id) ON DELETE CASCADE,
    selected_values TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, product_parameter_id)
);

-- Create index for the new table
CREATE INDEX idx_product_parameter_selections_product_id ON product_parameter_selections(product_id);