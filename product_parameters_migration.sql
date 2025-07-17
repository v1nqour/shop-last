-- Additional Migration Script for Product-Specific Parameters System
-- Execute these SQL commands in your PostgreSQL database

-- 1. Create Product Parameters table (defines parameters specific to each product)
CREATE TABLE IF NOT EXISTS product_parameters (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL, -- References products.id
    parameter_name VARCHAR(100) NOT NULL,
    parameter_type VARCHAR(50) DEFAULT 'dropdown', -- 'dropdown', 'checkbox', 'text', 'number'
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    depends_on_parameter INTEGER REFERENCES product_parameters(id) ON DELETE SET NULL,
    depends_on_value VARCHAR(200), -- The value that triggers this parameter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, parameter_name)
);

-- 2. Create Product Parameter Values table (defines possible values for each product parameter)
CREATE TABLE IF NOT EXISTS product_parameter_values (
    id SERIAL PRIMARY KEY,
    parameter_id INTEGER REFERENCES product_parameters(id) ON DELETE CASCADE,
    value_name VARCHAR(200) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Product Parameter Selections table (stores user selections for cart/orders)
CREATE TABLE IF NOT EXISTS product_parameter_selections (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL, -- References products.id
    parameter_id INTEGER REFERENCES product_parameters(id) ON DELETE CASCADE,
    selected_values TEXT[], -- Array of selected value IDs or text values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_parameters_product_id ON product_parameters(product_id);
CREATE INDEX IF NOT EXISTS idx_product_parameters_display_order ON product_parameters(display_order);
CREATE INDEX IF NOT EXISTS idx_product_parameters_depends_on ON product_parameters(depends_on_parameter);
CREATE INDEX IF NOT EXISTS idx_product_parameter_values_parameter_id ON product_parameter_values(parameter_id);
CREATE INDEX IF NOT EXISTS idx_product_parameter_values_display_order ON product_parameter_values(display_order);
CREATE INDEX IF NOT EXISTS idx_product_parameter_selections_product_id ON product_parameter_selections(product_id);

-- 5. Add some sample product-specific parameters for testing
-- These would typically be added through the admin interface

-- Sample parameters for a hypothetical flowmeter product
-- INSERT INTO product_parameters (product_id, parameter_name, parameter_type, is_required, display_order) VALUES
-- ('sample-flowmeter-1', 'Size', 'dropdown', true, 1),
-- ('sample-flowmeter-1', 'Material', 'dropdown', true, 2),
-- ('sample-flowmeter-1', 'Liquidity Type', 'dropdown', false, 3),
-- ('sample-flowmeter-1', 'Temperature Range', 'dropdown', false, 4);

-- Sample parameter values for the above parameters
-- INSERT INTO product_parameter_values (parameter_id, value_name, display_order) VALUES
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Size'), '1 inch', 1),
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Size'), '2 inch', 2),
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Size'), '3 inch', 3),
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Material'), 'Stainless Steel', 1),
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Material'), 'Brass', 2),
-- ((SELECT id FROM product_parameters WHERE product_id = 'sample-flowmeter-1' AND parameter_name = 'Material'), 'PVC', 3);

-- Migration complete
-- Product-specific parameters system is now ready to use