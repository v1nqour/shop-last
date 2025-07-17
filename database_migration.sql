-- Database Migration Script for Product Families System (English Only)
-- Execute these SQL commands in your PostgreSQL database

-- 1. Create Product Families table
CREATE TABLE IF NOT EXISTS product_families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Family Parameters table (defines what parameters each family has)
CREATE TABLE IF NOT EXISTS family_parameters (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES product_families(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_type VARCHAR(50) DEFAULT 'select', -- 'select', 'multiselect', 'text'
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Parameter Values table (defines possible values for each parameter)
CREATE TABLE IF NOT EXISTS parameter_values (
    id SERIAL PRIMARY KEY,
    parameter_id INTEGER REFERENCES family_parameters(id) ON DELETE CASCADE,
    value_name VARCHAR(200) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Product Parameter Selections table (stores user selections)
CREATE TABLE IF NOT EXISTS product_parameter_selections (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL, -- References products.id
    parameter_id INTEGER REFERENCES family_parameters(id) ON DELETE CASCADE,
    selected_values TEXT[], -- Array of selected value IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add family_id column to existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS family_id INTEGER REFERENCES product_families(id);

-- 6. Remove discount-related columns from products table
ALTER TABLE products DROP COLUMN IF EXISTS discount;

-- 7. Insert the 8 product families
INSERT INTO product_families (name, description) VALUES
('Flowmeter', 'Flow measurement instruments'),
('Liquid Analysis', 'Liquid analysis equipment'),
('Level', 'Level measurement devices'),
('Pressure', 'Pressure measurement instruments'),
('System Products', 'System integration products'),
('Temperature', 'Temperature measurement devices'),
('Valve', 'Valve control systems'),
('Gas Detector', 'Gas detection equipment');

-- 8. Create some default parameters for each family

-- Flowmeter Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Flowmeter'), 'Flow Rate Range', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Flowmeter'), 'Fluid Type', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Flowmeter'), 'Connection Type', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Flowmeter'), 'Output Signal', 'select', false, 4);

-- Liquid Analysis Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Liquid Analysis'), 'Measurement Type', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Liquid Analysis'), 'pH Range', 'select', false, 2),
((SELECT id FROM product_families WHERE name = 'Liquid Analysis'), 'Temperature Range', 'select', false, 3);

-- Level Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Level'), 'Measurement Range', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Level'), 'Technology', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Level'), 'Process Connection', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Level'), 'Medium Temperature', 'select', false, 4);

-- Pressure Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Pressure'), 'Pressure Range', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Pressure'), 'Accuracy', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Pressure'), 'Process Connection', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Pressure'), 'Output Signal', 'select', false, 4);

-- System Products Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'System Products'), 'System Type', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'System Products'), 'Communication Protocol', 'select', false, 2),
((SELECT id FROM product_families WHERE name = 'System Products'), 'Power Supply', 'select', false, 3);

-- Temperature Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Temperature'), 'Temperature Range', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Temperature'), 'Sensor Type', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Temperature'), 'Process Connection', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Temperature'), 'Accuracy', 'select', false, 4);

-- Valve Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Valve'), 'Valve Type', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Valve'), 'Actuator Type', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Valve'), 'Pipe Size', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Valve'), 'Material', 'select', false, 4);

-- Gas Detector Parameters
INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order) VALUES
((SELECT id FROM product_families WHERE name = 'Gas Detector'), 'Gas Type', 'select', true, 1),
((SELECT id FROM product_families WHERE name = 'Gas Detector'), 'Detection Range', 'select', true, 2),
((SELECT id FROM product_families WHERE name = 'Gas Detector'), 'Sensor Technology', 'select', false, 3),
((SELECT id FROM product_families WHERE name = 'Gas Detector'), 'Output Type', 'select', false, 4);

-- 9. Add some sample parameter values

-- Flowmeter parameter values
INSERT INTO parameter_values (parameter_id, value_name, display_order) VALUES
-- Flow Rate Range
((SELECT id FROM family_parameters WHERE parameter_name = 'Flow Rate Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), '0-10 L/min', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Flow Rate Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), '0-100 L/min', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Flow Rate Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), '0-1000 L/min', 3),
-- Fluid Type
((SELECT id FROM family_parameters WHERE parameter_name = 'Fluid Type' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Water', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Fluid Type' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Oil', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Fluid Type' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Gas', 3),
-- Connection Type
((SELECT id FROM family_parameters WHERE parameter_name = 'Connection Type' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Threaded', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Connection Type' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Flanged', 2),
-- Output Signal
((SELECT id FROM family_parameters WHERE parameter_name = 'Output Signal' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), '4-20mA', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Output Signal' AND family_id = (SELECT id FROM product_families WHERE name = 'Flowmeter')), 'Digital', 2);

-- Level parameter values
INSERT INTO parameter_values (parameter_id, value_name, display_order) VALUES
-- Measurement Range
((SELECT id FROM family_parameters WHERE parameter_name = 'Measurement Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), '0-20m', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Measurement Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), '0-30m', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Measurement Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), '0-60m', 3),
-- Technology
((SELECT id FROM family_parameters WHERE parameter_name = 'Technology' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), 'Radar', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Technology' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), 'Ultrasonic', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Technology' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), 'Guided Wave', 3),
-- Process Connection
((SELECT id FROM family_parameters WHERE parameter_name = 'Process Connection' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), 'Thread', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Process Connection' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), 'Flange', 2),
-- Medium Temperature
((SELECT id FROM family_parameters WHERE parameter_name = 'Medium Temperature' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), '-40°C to 80°C', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Medium Temperature' AND family_id = (SELECT id FROM product_families WHERE name = 'Level')), '-40°C to 150°C', 2);

-- Pressure parameter values
INSERT INTO parameter_values (parameter_id, value_name, display_order) VALUES
-- Pressure Range
((SELECT id FROM family_parameters WHERE parameter_name = 'Pressure Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '0-1 bar', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Pressure Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '0-10 bar', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Pressure Range' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '0-100 bar', 3),
-- Accuracy
((SELECT id FROM family_parameters WHERE parameter_name = 'Accuracy' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '±0.1%', 1),
((SELECT id FROM family_parameters WHERE parameter_name = 'Accuracy' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '±0.25%', 2),
((SELECT id FROM family_parameters WHERE parameter_name = 'Accuracy' AND family_id = (SELECT id FROM product_families WHERE name = 'Pressure')), '±0.5%', 3);

-- 10. Migrate existing products to Level family (since they appear to be level measurement devices)
UPDATE products SET family_id = (SELECT id FROM product_families WHERE name = 'Level') WHERE family_id IS NULL;

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_family_id ON products(family_id);
CREATE INDEX IF NOT EXISTS idx_family_parameters_family_id ON family_parameters(family_id);
CREATE INDEX IF NOT EXISTS idx_parameter_values_parameter_id ON parameter_values(parameter_id);
CREATE INDEX IF NOT EXISTS idx_product_parameter_selections_product_id ON product_parameter_selections(product_id);

-- 12. Create a view for easy querying of products with their families
CREATE OR REPLACE VIEW products_with_families AS
SELECT 
    p.*,
    pf.name as family_name,
    pf.description as family_description
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id;

-- End of migration script
-- After running this script, your database will be ready for the new product families system (English only)!