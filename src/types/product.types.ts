// Updated product types for the new family system

export interface ProductFamily {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

// Product-based parameter system
export interface ProductParameter {
  id: number;
  product_id: string;
  parameter_name: string;
  parameter_type:
    | 'dropdown'
    | 'checkbox'
    | 'radio'
    | 'text'
    | 'number'
    | 'textarea'
    | 'multiselect';
  is_required: boolean;
  display_order: number;
  depends_on_parameter?: number | null;
  depends_on_value?: string | null;
  created_at?: string;
}

export interface ProductParameterValue {
  id: number;
  parameter_id: number;
  value_name: string;
  display_order: number;
  created_at?: string;
}

export interface ProductParameterSelection {
  id: number;
  product_id: string;
  parameter_id: number;
  selected_values: string[]; // Array of parameter value IDs
  created_at?: string;
}

export interface ProductParameterWithValues extends ProductParameter {
  values: ProductParameterValue[];
}

export interface ProductParameterSelectionWithDetails {
  parameter: ProductParameter;
  selected_values: ProductParameterValue[];
}

// Legacy interfaces for backward compatibility (to be removed after migration)
export interface FamilyParameter {
  id: number;
  family_id: number;
  parameter_name: string;
  parameter_type: 'dropdown' | 'checkbox' | 'table_checkbox' | 'text'| "select" | "multiselect";
  is_required: boolean;
  display_order: number;
  created_at?: string;
}

export interface ParameterValue {
  id: number;
  parameter_id: number;
  value_name: string;
  display_order: number;
  created_at?: string;
}

export interface FamilyParameterWithValues extends FamilyParameter {
  values: ParameterValue[];
}

// Updated Product interface (removed discount)
export interface Product {
  id: string;
  title: string;
  srcUrl: string;
  name: string;
  gallery: string[];
  price: number;
  category: string;
  rating: number;
  specifications: { label: string; value: string }[];
  description: string;
  disablePrice: boolean;
  family_id?: number;
  family?: ProductFamily;
  parameter_selections?: ProductParameterSelectionWithDetails[];
}

// For creating/updating products
export interface ProductFormData extends Omit<Product, 'id' | 'family' | 'parameter_selections'> {
  family_id: number;
  parameter_selections: {
    parameter_id: number;
    selected_values: string[];
  }[];
}

// Email order types
export interface OrderEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  shippingAddress: string;
  dateLimit: string;
  productDetails: {
    product: Product;
    selectedParameters: ProductParameterSelectionWithDetails[];
  }[];
}