// Utility functions for product families and parameters

import { neon } from '@neondatabase/serverless';
import { 
  ProductFamily, 
  FamilyParameter, 
  ParameterValue, 
  FamilyParameterWithValues,
  ProductParameterSelection,
  ProductParameterSelectionWithDetails
} from '@/types/product.types';

const sql = neon(process.env.DATABASE_URL!);

// Product Families
export async function getProductFamilies(): Promise<ProductFamily[]> {
  try {
    const families = await sql`SELECT * FROM product_families ORDER BY name`;
    return families.map(family => ({
      id: family.id,
      name: family.name,
      description: family.description,
      created_at: family.created_at,
    }));
  } catch (error) {
    console.error('Error fetching product families:', error);
    return [];
  }
}

export async function getProductFamily(id: number): Promise<ProductFamily | null> {
  try {
    const families = await sql`SELECT * FROM product_families WHERE id = ${id}`;
    if (families.length === 0) return null;
    
    const family = families[0];
    return {
      id: family.id,
      name: family.name,
      description: family.description,
      created_at: family.created_at,
    };
  } catch (error) {
    console.error('Error fetching product family:', error);
    return null;
  }
}

// Family Parameters
export async function getFamilyParameters(familyId: number): Promise<FamilyParameterWithValues[]> {
  try {
    const parameters = await sql`
      SELECT 
        fp.*,
        json_agg(
          json_build_object(
            'id', pv.id,
            'parameter_id', pv.parameter_id,
            'value_name', pv.value_name,
            'display_order', pv.display_order
          ) ORDER BY pv.display_order
        ) as values
      FROM family_parameters fp
      LEFT JOIN parameter_values pv ON fp.id = pv.parameter_id
      WHERE fp.family_id = ${familyId}
      GROUP BY fp.id
      ORDER BY fp.display_order
    `;

    return parameters.map(param => ({
      id: param.id,
      family_id: param.family_id,
      parameter_name: param.parameter_name,
      parameter_type: param.parameter_type,
      is_required: param.is_required,
      display_order: param.display_order,
      created_at: param.created_at,
      values: param.values ? param.values.filter((v: any) => v.id !== null) : [],
    }));
  } catch (error) {
    console.error('Error fetching family parameters:', error);
    return [];
  }
}

export async function addFamilyParameter(
  familyId: number,
  parameterName: string,
  parameterType: string = 'select',
  isRequired: boolean = false,
  displayOrder: number = 0
): Promise<FamilyParameter | null> {
  try {
    const result = await sql`
      INSERT INTO family_parameters (family_id, parameter_name, parameter_type, is_required, display_order)
      VALUES (${familyId}, ${parameterName}, ${parameterType}, ${isRequired}, ${displayOrder})
      RETURNING *
    `;
    
    if (result.length === 0) return null;
    
    const param = result[0];
    return {
      id: param.id,
      family_id: param.family_id,
      parameter_name: param.parameter_name,
      parameter_type: param.parameter_type,
      is_required: param.is_required,
      display_order: param.display_order,
      created_at: param.created_at,
    };
  } catch (error) {
    console.error('Error adding family parameter:', error);
    return null;
  }
}

// Parameter Values
export async function getParameterValues(parameterId: number): Promise<ParameterValue[]> {
  try {
    const values = await sql`
      SELECT * FROM parameter_values 
      WHERE parameter_id = ${parameterId} 
      ORDER BY display_order
    `;
    
    return values.map(value => ({
      id: value.id,
      parameter_id: value.parameter_id,
      value_name: value.value_name,
      display_order: value.display_order,
      created_at: value.created_at,
    }));
  } catch (error) {
    console.error('Error fetching parameter values:', error);
    return [];
  }
}

export async function addParameterValue(
  parameterId: number,
  valueName: string,
  displayOrder: number = 0
): Promise<ParameterValue | null> {
  try {
    const result = await sql`
      INSERT INTO parameter_values (parameter_id, value_name, display_order)
      VALUES (${parameterId}, ${valueName}, ${displayOrder})
      RETURNING *
    `;
    
    if (result.length === 0) return null;
    
    const value = result[0];
    return {
      id: value.id,
      parameter_id: value.parameter_id,
      value_name: value.value_name,
      display_order: value.display_order,
      created_at: value.created_at,
    };
  } catch (error) {
    console.error('Error adding parameter value:', error);
    return null;
  }
}

// Product Parameter Selections
export async function getProductParameterSelections(productId: string): Promise<ProductParameterSelectionWithDetails[]> {
  try {
    const selections = await sql`
      SELECT 
        pps.*,
        fp.parameter_name,
        fp.parameter_type,
        fp.is_required,
        json_agg(
          json_build_object(
            'id', pv.id,
            'parameter_id', pv.parameter_id,
            'value_name', pv.value_name,
            'display_order', pv.display_order
          ) ORDER BY pv.display_order
        ) as selected_values_details
      FROM product_parameter_selections pps
      JOIN family_parameters fp ON pps.product_parameter_id = fp.id
      LEFT JOIN parameter_values pv ON pv.id = ANY(pps.selected_values::int[])
      WHERE pps.product_id = ${productId}
      GROUP BY pps.id, fp.id
      ORDER BY fp.display_order
    `;

    return selections.map(selection => ({
      parameter: {
        id: selection.product_parameter_id,
        product_id: selection.product_id,
        family_id: 0, // Will be populated if needed
        parameter_name: selection.parameter_name,
        parameter_type: selection.parameter_type,
        is_required: selection.is_required,
        display_order: 0,
      },
      selected_values: selection.selected_values_details ? selection.selected_values_details.filter((v: any) => v.id !== null) : [],
    }));
  } catch (error) {
    console.error('Error fetching product parameter selections:', error);
    return [];
  }
}

export async function saveProductParameterSelections(
  productId: string,
  selections: { parameter_id: number; selected_values: string[] }[]
): Promise<boolean> {
  try {
    // First, delete existing selections for this product
    await sql`DELETE FROM product_parameter_selections WHERE product_id = ${productId}`;
    
    // Then insert new selections
    for (const selection of selections) {
      if (selection.selected_values.length > 0) {
        await sql`
          INSERT INTO product_parameter_selections (product_id, parameter_id, selected_values)
          VALUES (${productId}, ${selection.parameter_id}, ${selection.selected_values})
        `;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving product parameter selections:', error);
    return false;
  }
}