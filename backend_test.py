#!/usr/bin/env python3
"""
Backend API Testing for Industrial Equipment Parameter Management System (Next.js)
Tests all CRUD operations for families, parameters, parameter values, products by family,
and the new product-based parameter system
"""

import requests
import json
import sys
import os
from typing import Dict, Any, List, Optional

# Use localhost for testing Next.js API
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.created_resources = {
            'families': [],
            'parameters': [],
            'parameter_values': [],
            'products': [],
            'product_parameters': [],
            'product_parameter_values': []
        }

    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
        
        if details and not success:
            print(f"   Details: {details}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{API_BASE}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                return False, f"Unsupported method: {method}", 400
            
            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, str(e), 0

    def test_families_api(self):
        """Test Families API CRUD operations"""
        print("\n=== Testing Families API ===")
        
        # Test GET /api/families (should work even if empty)
        success, data, status = self.make_request('GET', '/families')
        self.log_test("GET /api/families", success, 
                     f"Fetched families list (status: {status})", data)
        
        if not success:
            return False
        
        # Test POST /api/families - Create new family
        test_family = {
            "name": "Test Equipment Family",
            "description": "A test family for industrial equipment testing"
        }
        
        success, data, status = self.make_request('POST', '/families', test_family)
        self.log_test("POST /api/families", success, 
                     f"Created new family (status: {status})", data)
        
        if success and isinstance(data, dict) and 'id' in data:
            family_id = data['id']
            self.created_resources['families'].append(family_id)
            
            # Test PUT /api/families - Update family
            updated_family = {
                "id": family_id,
                "name": "Updated Test Equipment Family",
                "description": "Updated description for test family"
            }
            
            success, data, status = self.make_request('PUT', '/families', updated_family)
            self.log_test("PUT /api/families", success, 
                         f"Updated family (status: {status})", data)
            
            # Test GET /api/families again to verify update
            success, data, status = self.make_request('GET', '/families')
            if success and isinstance(data, list):
                updated_found = any(f.get('name') == 'Updated Test Equipment Family' for f in data)
                self.log_test("GET /api/families (verify update)", updated_found, 
                             "Verified family update in list")
            
            return family_id
        else:
            return False

    def test_parameters_api(self, family_id):
        """Test Parameters API CRUD operations"""
        print("\n=== Testing Parameters API ===")
        
        # Test GET /api/parameters with familyId
        success, data, status = self.make_request('GET', '/parameters', params={'familyId': family_id})
        self.log_test("GET /api/parameters", success, 
                     f"Fetched parameters for family (status: {status})", data)
        
        if not success:
            return False
        
        # Test POST /api/parameters - Create dropdown parameter
        dropdown_param = {
            "family_id": family_id,
            "parameter_name": "Flow Rate Range",
            "parameter_type": "dropdown",
            "is_required": True,
            "display_order": 1
        }
        
        success, data, status = self.make_request('POST', '/parameters', dropdown_param)
        self.log_test("POST /api/parameters (dropdown)", success, 
                     f"Created dropdown parameter (status: {status})", data)
        
        dropdown_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            dropdown_param_id = data['id']
            self.created_resources['parameters'].append(dropdown_param_id)
        
        # Test POST /api/parameters - Create checkbox parameter
        checkbox_param = {
            "family_id": family_id,
            "parameter_name": "Additional Features",
            "parameter_type": "checkbox",
            "is_required": False,
            "display_order": 2
        }
        
        success, data, status = self.make_request('POST', '/parameters', checkbox_param)
        self.log_test("POST /api/parameters (checkbox)", success, 
                     f"Created checkbox parameter (status: {status})", data)
        
        checkbox_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            checkbox_param_id = data['id']
            self.created_resources['parameters'].append(checkbox_param_id)
        
        # Test POST /api/parameters - Create table_checkbox parameter
        table_param = {
            "family_id": family_id,
            "parameter_name": "Compatibility Matrix",
            "parameter_type": "table_checkbox",
            "is_required": False,
            "display_order": 3
        }
        
        success, data, status = self.make_request('POST', '/parameters', table_param)
        self.log_test("POST /api/parameters (table_checkbox)", success, 
                     f"Created table_checkbox parameter (status: {status})", data)
        
        table_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            table_param_id = data['id']
            self.created_resources['parameters'].append(table_param_id)
        
        # Test PUT /api/parameters - Update parameter
        if dropdown_param_id:
            updated_param = {
                "id": dropdown_param_id,
                "parameter_name": "Updated Flow Rate Range",
                "parameter_type": "dropdown",
                "is_required": True,
                "display_order": 1
            }
            
            success, data, status = self.make_request('PUT', '/parameters', updated_param)
            self.log_test("PUT /api/parameters", success, 
                         f"Updated parameter (status: {status})", data)
        
        # Test GET /api/parameters again to verify all parameters
        success, data, status = self.make_request('GET', '/parameters', params={'familyId': family_id})
        if success and isinstance(data, list):
            param_count = len(data)
            self.log_test("GET /api/parameters (verify creation)", param_count >= 3, 
                         f"Verified {param_count} parameters created")
        
        return {
            'dropdown': dropdown_param_id,
            'checkbox': checkbox_param_id,
            'table_checkbox': table_param_id
        }

    def test_parameter_values_api(self, parameter_ids):
        """Test Parameter Values API CRUD operations"""
        print("\n=== Testing Parameter Values API ===")
        
        dropdown_param_id = parameter_ids.get('dropdown')
        if not dropdown_param_id:
            self.log_test("Parameter Values Test", False, "No dropdown parameter ID available")
            return False
        
        # Test GET /api/parameter-values
        success, data, status = self.make_request('GET', '/parameter-values', 
                                                 params={'parameterId': dropdown_param_id})
        self.log_test("GET /api/parameter-values", success, 
                     f"Fetched parameter values (status: {status})", data)
        
        # Test POST /api/parameter-values - Create multiple values
        test_values = [
            {"parameter_id": dropdown_param_id, "value_name": "0-10 L/min", "display_order": 1},
            {"parameter_id": dropdown_param_id, "value_name": "10-50 L/min", "display_order": 2},
            {"parameter_id": dropdown_param_id, "value_name": "50-100 L/min", "display_order": 3},
            {"parameter_id": dropdown_param_id, "value_name": "100+ L/min", "display_order": 4}
        ]
        
        created_value_ids = []
        for value_data in test_values:
            success, data, status = self.make_request('POST', '/parameter-values', value_data)
            self.log_test(f"POST /api/parameter-values ({value_data['value_name']})", success, 
                         f"Created parameter value (status: {status})", data)
            
            if success and isinstance(data, dict) and 'id' in data:
                created_value_ids.append(data['id'])
                self.created_resources['parameter_values'].append(data['id'])
        
        # Test PUT /api/parameter-values - Update a value
        if created_value_ids:
            updated_value = {
                "id": created_value_ids[0],
                "value_name": "0-15 L/min (Updated)",
                "display_order": 1
            }
            
            success, data, status = self.make_request('PUT', '/parameter-values', updated_value)
            self.log_test("PUT /api/parameter-values", success, 
                         f"Updated parameter value (status: {status})", data)
        
        # Test GET /api/parameter-values again to verify all values
        success, data, status = self.make_request('GET', '/parameter-values', 
                                                 params={'parameterId': dropdown_param_id})
        if success and isinstance(data, list):
            value_count = len(data)
            self.log_test("GET /api/parameter-values (verify creation)", value_count >= 4, 
                         f"Verified {value_count} parameter values created")
        
        return created_value_ids

    def test_products_by_family_api(self, family_id):
        """Test Products by Family API"""
        print("\n=== Testing Products by Family API ===")
        
        # Test GET /api/products/by-family
        success, data, status = self.make_request('GET', '/products/by-family', 
                                                 params={'familyId': family_id})
        self.log_test("GET /api/products/by-family", success, 
                     f"Fetched products by family (status: {status})", data)
        
        # This should return an empty array or products if any exist
        if success and isinstance(data, list):
            self.log_test("Products by Family Response Format", True, 
                         f"Returned {len(data)} products for family")
        
        return success

    def test_database_migration(self):
        """Test Database Migration API"""
        print("\n=== Testing Database Migration ===")
        
        # Test GET /api/migrate - Run migration
        success, data, status = self.make_request('GET', '/migrate')
        self.log_test("GET /api/migrate", success, 
                     f"Database migration (status: {status})", data)
        
        if success and isinstance(data, dict):
            if data.get('created'):
                self.log_test("Migration Tables Created", True, 
                             "New product parameter tables created successfully")
            else:
                self.log_test("Migration Tables Exist", True, 
                             "Product parameter tables already exist")
        
        return success

    def test_product_parameters_api(self, product_id):
        """Test Product Parameters API CRUD operations"""
        print(f"\n=== Testing Product Parameters API for Product {product_id} ===")
        
        # Test GET /api/products/[productId]/parameters
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters')
        self.log_test(f"GET /api/products/{product_id}/parameters", success, 
                     f"Fetched product parameters (status: {status})", data)
        
        if not success:
            return False
        
        # Test POST /api/products/[productId]/parameters - Create dropdown parameter
        dropdown_param = {
            "parameter_name": "Motor Power Rating",
            "parameter_type": "dropdown",
            "is_required": True,
            "display_order": 1,
            "depends_on_parameter": None,
            "depends_on_value": None
        }
        
        success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', dropdown_param)
        self.log_test(f"POST /api/products/{product_id}/parameters (dropdown)", success, 
                     f"Created dropdown parameter (status: {status})", data)
        
        dropdown_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            dropdown_param_id = data['id']
            self.created_resources['product_parameters'].append(dropdown_param_id)
        
        # Test POST - Create checkbox parameter
        checkbox_param = {
            "parameter_name": "Safety Features",
            "parameter_type": "checkbox",
            "is_required": False,
            "display_order": 2,
            "depends_on_parameter": None,
            "depends_on_value": None
        }
        
        success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', checkbox_param)
        self.log_test(f"POST /api/products/{product_id}/parameters (checkbox)", success, 
                     f"Created checkbox parameter (status: {status})", data)
        
        checkbox_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            checkbox_param_id = data['id']
            self.created_resources['product_parameters'].append(checkbox_param_id)
        
        # Test POST - Create dependent parameter
        dependent_param = {
            "parameter_name": "Voltage Configuration",
            "parameter_type": "radio",
            "is_required": True,
            "display_order": 3,
            "depends_on_parameter": dropdown_param_id,
            "depends_on_value": "High Power"
        }
        
        success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', dependent_param)
        self.log_test(f"POST /api/products/{product_id}/parameters (dependent)", success, 
                     f"Created dependent parameter (status: {status})", data)
        
        dependent_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            dependent_param_id = data['id']
            self.created_resources['product_parameters'].append(dependent_param_id)
        
        # Test PUT /api/products/[productId]/parameters - Update parameter
        if dropdown_param_id:
            updated_param = {
                "id": dropdown_param_id,
                "parameter_name": "Updated Motor Power Rating",
                "parameter_type": "dropdown",
                "is_required": True,
                "display_order": 1,
                "depends_on_parameter": None,
                "depends_on_value": None
            }
            
            success, data, status = self.make_request('PUT', f'/products/{product_id}/parameters', updated_param)
            self.log_test(f"PUT /api/products/{product_id}/parameters", success, 
                         f"Updated parameter (status: {status})", data)
        
        # Test GET again to verify all parameters
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters')
        if success and isinstance(data, list):
            param_count = len(data)
            self.log_test(f"GET /api/products/{product_id}/parameters (verify creation)", param_count >= 3, 
                         f"Verified {param_count} product parameters created")
        
        return {
            'dropdown': dropdown_param_id,
            'checkbox': checkbox_param_id,
            'dependent': dependent_param_id
        }

    def test_product_parameter_values_api(self, product_id, parameter_ids):
        """Test Product Parameter Values API CRUD operations"""
        print(f"\n=== Testing Product Parameter Values API for Product {product_id} ===")
        
        dropdown_param_id = parameter_ids.get('dropdown')
        if not dropdown_param_id:
            self.log_test("Product Parameter Values Test", False, "No dropdown parameter ID available")
            return False
        
        # Test GET /api/products/[productId]/parameters/[parameterId]/values
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters/{dropdown_param_id}/values')
        self.log_test(f"GET /api/products/{product_id}/parameters/{dropdown_param_id}/values", success, 
                     f"Fetched parameter values (status: {status})", data)
        
        # Test POST - Create multiple values
        test_values = [
            {"value_name": "Low Power (1-5 HP)", "display_order": 1},
            {"value_name": "Medium Power (5-15 HP)", "display_order": 2},
            {"value_name": "High Power (15-50 HP)", "display_order": 3},
            {"value_name": "Industrial Power (50+ HP)", "display_order": 4}
        ]
        
        created_value_ids = []
        for value_data in test_values:
            success, data, status = self.make_request('POST', f'/products/{product_id}/parameters/{dropdown_param_id}/values', value_data)
            self.log_test(f"POST /api/products/{product_id}/parameters/{dropdown_param_id}/values ({value_data['value_name']})", success, 
                         f"Created parameter value (status: {status})", data)
            
            if success and isinstance(data, dict) and 'id' in data:
                created_value_ids.append(data['id'])
                self.created_resources['product_parameter_values'].append(data['id'])
        
        # Test PUT - Update a value
        if created_value_ids:
            updated_value = {
                "id": created_value_ids[0],
                "value_name": "Low Power (1-7 HP) - Updated",
                "display_order": 1
            }
            
            success, data, status = self.make_request('PUT', f'/products/{product_id}/parameters/{dropdown_param_id}/values', updated_value)
            self.log_test(f"PUT /api/products/{product_id}/parameters/{dropdown_param_id}/values", success, 
                         f"Updated parameter value (status: {status})", data)
        
        # Test GET again to verify all values
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters/{dropdown_param_id}/values')
        if success and isinstance(data, list):
            value_count = len(data)
            self.log_test(f"GET /api/products/{product_id}/parameters/{dropdown_param_id}/values (verify creation)", value_count >= 4, 
                         f"Verified {value_count} parameter values created")
        
        return created_value_ids

    def test_parameter_types(self, product_id):
        """Test different parameter types"""
        print(f"\n=== Testing Different Parameter Types for Product {product_id} ===")
        
        parameter_types = [
            {"name": "Text Input", "type": "text", "required": True},
            {"name": "Number Input", "type": "number", "required": False},
            {"name": "Textarea Input", "type": "textarea", "required": False},
            {"name": "Multi-select Options", "type": "multiselect", "required": False}
        ]
        
        created_params = []
        for i, param_config in enumerate(parameter_types):
            param_data = {
                "parameter_name": param_config["name"],
                "parameter_type": param_config["type"],
                "is_required": param_config["required"],
                "display_order": i + 10,
                "depends_on_parameter": None,
                "depends_on_value": None
            }
            
            success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', param_data)
            self.log_test(f"POST parameter type '{param_config['type']}'", success, 
                         f"Created {param_config['type']} parameter (status: {status})", data)
            
            if success and isinstance(data, dict) and 'id' in data:
                created_params.append(data['id'])
                self.created_resources['product_parameters'].append(data['id'])
        
        return created_params

    def test_required_vs_optional(self, product_id):
        """Test required vs optional parameters"""
        print(f"\n=== Testing Required vs Optional Parameters for Product {product_id} ===")
        
        # Create required parameter
        required_param = {
            "parameter_name": "Required Specification",
            "parameter_type": "dropdown",
            "is_required": True,
            "display_order": 20,
            "depends_on_parameter": None,
            "depends_on_value": None
        }
        
        success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', required_param)
        self.log_test(f"POST required parameter", success, 
                     f"Created required parameter (status: {status})", data)
        
        required_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            required_param_id = data['id']
            self.created_resources['product_parameters'].append(required_param_id)
        
        # Create optional parameter
        optional_param = {
            "parameter_name": "Optional Feature",
            "parameter_type": "checkbox",
            "is_required": False,
            "display_order": 21,
            "depends_on_parameter": None,
            "depends_on_value": None
        }
        
        success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', optional_param)
        self.log_test(f"POST optional parameter", success, 
                     f"Created optional parameter (status: {status})", data)
        
        optional_param_id = None
        if success and isinstance(data, dict) and 'id' in data:
            optional_param_id = data['id']
            self.created_resources['product_parameters'].append(optional_param_id)
        
        return {'required': required_param_id, 'optional': optional_param_id}

    def test_admin_parameter_management_for_product_19(self):
        """Test admin page parameter management functionality for product ID 19"""
        print("\n=== Testing Admin Parameter Management for Product 19 ===")
        
        product_id = "19"
        
        # 1. Test GET /api/products/19/parameters - should return existing parameters
        print(f"\n1. Testing GET /api/products/{product_id}/parameters")
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters')
        self.log_test(f"GET /api/products/{product_id}/parameters", success, 
                     f"Fetched parameters for product {product_id} (status: {status})", data)
        
        if success and isinstance(data, list):
            print(f"   Found {len(data)} existing parameters")
            for param in data:
                if isinstance(param, dict):
                    print(f"   - {param.get('parameter_name', 'Unknown')} ({param.get('parameter_type', 'Unknown')})")
                    if param.get('values') and len(param['values']) > 0:
                        print(f"     Values: {len(param['values'])} items")
        
        # 2. Test POST - Create new parameters with different types
        print(f"\n2. Testing POST /api/products/{product_id}/parameters - Creating different parameter types")
        
        parameter_types_to_test = [
            {
                "parameter_name": "Motor Power Rating",
                "parameter_type": "dropdown",
                "is_required": True,
                "display_order": 100
            },
            {
                "parameter_name": "Safety Features",
                "parameter_type": "checkbox", 
                "is_required": False,
                "display_order": 101
            },
            {
                "parameter_name": "Operating Mode",
                "parameter_type": "radio",
                "is_required": True,
                "display_order": 102
            },
            {
                "parameter_name": "Custom Specifications",
                "parameter_type": "text",
                "is_required": False,
                "display_order": 103
            },
            {
                "parameter_name": "Flow Rate (L/min)",
                "parameter_type": "number",
                "is_required": True,
                "display_order": 104
            },
            {
                "parameter_name": "Additional Notes",
                "parameter_type": "textarea",
                "is_required": False,
                "display_order": 105
            },
            {
                "parameter_name": "Compatible Accessories",
                "parameter_type": "multiselect",
                "is_required": False,
                "display_order": 106
            }
        ]
        
        created_parameters = []
        for param_config in parameter_types_to_test:
            success, data, status = self.make_request('POST', f'/products/{product_id}/parameters', param_config)
            self.log_test(f"POST parameter type '{param_config['parameter_type']}'", success, 
                         f"Created {param_config['parameter_type']} parameter (status: {status})", data)
            
            if success and isinstance(data, dict) and 'id' in data:
                created_parameters.append({
                    'id': data['id'],
                    'type': param_config['parameter_type'],
                    'name': param_config['parameter_name']
                })
                self.created_resources['product_parameters'].append(data['id'])
        
        # 3. Test parameter values management for dropdown parameter
        print(f"\n3. Testing Parameter Values Management")
        dropdown_param = next((p for p in created_parameters if p['type'] == 'dropdown'), None)
        
        if dropdown_param:
            param_id = dropdown_param['id']
            print(f"   Testing values for parameter: {dropdown_param['name']} (ID: {param_id})")
            
            # Test POST parameter values
            test_values = [
                {"value_name": "Low Power (1-5 HP)", "display_order": 1},
                {"value_name": "Medium Power (5-15 HP)", "display_order": 2},
                {"value_name": "High Power (15-50 HP)", "display_order": 3},
                {"value_name": "Industrial Power (50+ HP)", "display_order": 4}
            ]
            
            created_values = []
            for value_data in test_values:
                success, data, status = self.make_request('POST', f'/products/{product_id}/parameters/{param_id}/values', value_data)
                self.log_test(f"POST parameter value '{value_data['value_name']}'", success, 
                             f"Created parameter value (status: {status})", data)
                
                if success and isinstance(data, dict) and 'id' in data:
                    created_values.append(data['id'])
                    self.created_resources['product_parameter_values'].append(data['id'])
            
            # Test GET parameter values
            success, data, status = self.make_request('GET', f'/products/{product_id}/parameters/{param_id}/values')
            self.log_test(f"GET parameter values", success, 
                         f"Fetched parameter values (status: {status})", data)
            
            if success and isinstance(data, list):
                print(f"   Retrieved {len(data)} parameter values")
                for value in data:
                    if isinstance(value, dict):
                        print(f"   - {value.get('value_name', 'Unknown')} (Order: {value.get('display_order', 'N/A')})")
        
        # 4. Test PUT - Update parameter
        print(f"\n4. Testing PUT /api/products/{product_id}/parameters - Update parameter")
        if created_parameters:
            param_to_update = created_parameters[0]
            updated_data = {
                "id": param_to_update['id'],
                "parameter_name": f"Updated {param_to_update['name']}",
                "parameter_type": param_to_update['type'],
                "is_required": True,
                "display_order": 200,
                "depends_on_parameter": None,
                "depends_on_value": None
            }
            
            success, data, status = self.make_request('PUT', f'/products/{product_id}/parameters', updated_data)
            self.log_test(f"PUT parameter update", success, 
                         f"Updated parameter (status: {status})", data)
        
        # 5. Test data integrity - verify parameters are associated with product
        print(f"\n5. Testing Data Integrity")
        success, data, status = self.make_request('GET', f'/products/{product_id}/parameters')
        if success and isinstance(data, list):
            param_count = len(data)
            expected_count = len(created_parameters)
            self.log_test(f"Data integrity check", param_count >= expected_count, 
                         f"Verified {param_count} parameters associated with product {product_id}")
            
            # Check parameter structure
            for param in data:
                if isinstance(param, dict):
                    required_fields = ['id', 'parameter_name', 'parameter_type', 'is_required', 'display_order']
                    has_all_fields = all(field in param for field in required_fields)
                    self.log_test(f"Parameter structure check", has_all_fields, 
                                 f"Parameter has all required fields: {param.get('parameter_name', 'Unknown')}")
                    
                    # Check if values array exists
                    has_values_array = 'values' in param
                    self.log_test(f"Parameter values array", has_values_array, 
                                 f"Parameter has values array: {param.get('parameter_name', 'Unknown')}")
        
        return created_parameters

    def get_test_product_id(self):
        """Get a product ID for testing - try to get from existing products"""
        print("\n=== Getting Test Product ID ===")
        
        # First try to get families to find products
        success, families_data, status = self.make_request('GET', '/families')
        if success and isinstance(families_data, list) and len(families_data) > 0:
            family_id = families_data[0]['id']
            
            # Get products by family
            success, products_data, status = self.make_request('GET', '/products/by-family', 
                                                             params={'familyId': family_id})
            if success and isinstance(products_data, list) and len(products_data) > 0:
                product_id = products_data[0]['id']
                self.log_test("Get Test Product ID", True, f"Using existing product ID: {product_id}")
                return product_id
        
        # If no products found, use a test product ID
        test_product_id = "test-product-001"
        self.log_test("Get Test Product ID", True, f"Using test product ID: {test_product_id}")
        return test_product_id

    def test_delete_product_parameters(self, product_id):
        """Test DELETE operations for product parameters"""
        print(f"\n=== Testing DELETE Operations for Product {product_id} ===")
        
        # Delete parameter values first
        for value_id in self.created_resources['product_parameter_values']:
            success, data, status = self.make_request('DELETE', f'/products/{product_id}/parameters/dummy/values', 
                                                     params={'id': value_id})
            self.log_test(f"DELETE product parameter value (ID: {value_id})", success, 
                         f"Deleted parameter value (status: {status})", data)
        
    def test_cascade_operations(self, product_id, created_parameters):
        """Test cascade operations - deleting parameter should remove values"""
        print(f"\n=== Testing Cascade Operations for Product {product_id} ===")
        
        if not created_parameters:
            self.log_test("Cascade Operations Test", False, "No parameters available for cascade testing")
            return False
        
        # Find a parameter with values to test cascade delete
        dropdown_param = next((p for p in created_parameters if p['type'] == 'dropdown'), None)
        
        if dropdown_param:
            param_id = dropdown_param['id']
            
            # First verify parameter has values
            success, values_data, status = self.make_request('GET', f'/products/{product_id}/parameters/{param_id}/values')
            if success and isinstance(values_data, list) and len(values_data) > 0:
                value_count_before = len(values_data)
                print(f"   Parameter has {value_count_before} values before deletion")
                
                # Delete the parameter
                success, data, status = self.make_request('DELETE', f'/products/{product_id}/parameters', 
                                                         params={'id': param_id})
                self.log_test(f"DELETE parameter (cascade test)", success, 
                             f"Deleted parameter with cascade (status: {status})", data)
                
                if success:
                    # Verify values were also deleted (should return empty or 404)
                    success, values_data, status = self.make_request('GET', f'/products/{product_id}/parameters/{param_id}/values')
                    values_deleted = not success or (isinstance(values_data, list) and len(values_data) == 0)
                    self.log_test(f"Cascade delete verification", values_deleted, 
                                 f"Parameter values were properly deleted with parameter")
                    
                    # Remove from tracking since it's deleted
                    if param_id in self.created_resources['product_parameters']:
                        self.created_resources['product_parameters'].remove(param_id)
                    
                    return True
        
        return False

    def test_delete_operations_product_19(self, product_id):
        """Test DELETE operations for product 19 parameters"""
        print(f"\n=== Testing DELETE Operations for Product {product_id} ===")
        
        # Delete parameter values first
        for value_id in self.created_resources['product_parameter_values']:
            success, data, status = self.make_request('DELETE', f'/products/{product_id}/parameters/dummy/values', 
                                                     params={'id': value_id})
            self.log_test(f"DELETE product parameter value (ID: {value_id})", success, 
                         f"Deleted parameter value (status: {status})", data)
        
        # Delete parameters
        for param_id in self.created_resources['product_parameters']:
            success, data, status = self.make_request('DELETE', f'/products/{product_id}/parameters', 
                                                     params={'id': param_id})
            self.log_test(f"DELETE product parameter (ID: {param_id})", success, 
                         f"Deleted parameter (status: {status})", data)

    def run_admin_parameter_tests(self):
        """Run focused tests for admin parameter management functionality"""
        print(f"🚀 Starting Admin Parameter Management Tests")
        print(f"📍 Testing against: {API_BASE}")
        print("=" * 80)
        
        try:
            # Test basic connectivity
            success, data, status = self.make_request('GET', '/families')
            if not success:
                self.log_test("API Connectivity", False, 
                             f"Cannot connect to API at {API_BASE}")
                return False
            
            # Run the main admin parameter management test for product 19
            created_parameters = self.test_admin_parameter_management_for_product_19()
            
            if created_parameters:
                # Test cascade operations
                self.test_cascade_operations("19", created_parameters)
                
                # Clean up remaining resources
                self.test_delete_operations_product_19("19")
            
            return True
            
        except Exception as e:
            self.log_test("Test Execution", False, f"Unexpected error: {str(e)}")
            return False
    def test_delete_operations(self):
        """Test DELETE operations in correct order"""
        print("\n=== Testing DELETE Operations ===")
        
        # Delete parameter values first
        for value_id in self.created_resources['parameter_values']:
            success, data, status = self.make_request('DELETE', '/parameter-values', 
                                                     params={'id': value_id})
            self.log_test(f"DELETE /api/parameter-values (ID: {value_id})", success, 
                         f"Deleted parameter value (status: {status})", data)
        
        # Delete parameters
        for param_id in self.created_resources['parameters']:
            success, data, status = self.make_request('DELETE', '/parameters', 
                                                     params={'id': param_id})
            self.log_test(f"DELETE /api/parameters (ID: {param_id})", success, 
                         f"Deleted parameter (status: {status})", data)
        
        # Delete families
        for family_id in self.created_resources['families']:
            success, data, status = self.make_request('DELETE', '/families', 
                                                     params={'id': family_id})
            self.log_test(f"DELETE /api/families (ID: {family_id})", success, 
                         f"Deleted family (status: {status})", data)
        """Test DELETE operations in correct order"""
        print("\n=== Testing DELETE Operations ===")
        
        # Delete parameter values first
        for value_id in self.created_resources['parameter_values']:
            success, data, status = self.make_request('DELETE', '/parameter-values', 
                                                     params={'id': value_id})
            self.log_test(f"DELETE /api/parameter-values (ID: {value_id})", success, 
                         f"Deleted parameter value (status: {status})", data)
        
        # Delete parameters
        for param_id in self.created_resources['parameters']:
            success, data, status = self.make_request('DELETE', '/parameters', 
                                                     params={'id': param_id})
            self.log_test(f"DELETE /api/parameters (ID: {param_id})", success, 
                         f"Deleted parameter (status: {status})", data)
        
        # Delete families
        for family_id in self.created_resources['families']:
            success, data, status = self.make_request('DELETE', '/families', 
                                                     params={'id': family_id})
            self.log_test(f"DELETE /api/families (ID: {family_id})", success, 
                         f"Deleted family (status: {status})", data)

    def test_error_scenarios(self):
        """Test error handling scenarios"""
        print("\n=== Testing Error Scenarios ===")
        
        # Test GET parameters without familyId
        success, data, status = self.make_request('GET', '/parameters')
        self.log_test("GET /api/parameters (no familyId)", not success and status == 400, 
                     f"Correctly rejected request without familyId (status: {status})", data)
        
        # Test GET parameter-values without parameterId
        success, data, status = self.make_request('GET', '/parameter-values')
        self.log_test("GET /api/parameter-values (no parameterId)", not success and status == 400, 
                     f"Correctly rejected request without parameterId (status: {status})", data)
        
        # Test GET products/by-family without familyId
        success, data, status = self.make_request('GET', '/products/by-family')
        self.log_test("GET /api/products/by-family (no familyId)", not success and status == 400, 
                     f"Correctly rejected request without familyId (status: {status})", data)
        
        # Test DELETE with non-existent IDs
        success, data, status = self.make_request('DELETE', '/families', params={'id': '99999'})
        self.log_test("DELETE /api/families (non-existent ID)", not success and status == 404, 
                     f"Correctly handled non-existent family (status: {status})", data)
        
        # Test product parameter error scenarios
        test_product_id = "non-existent-product"
        
        # Test GET product parameters for non-existent product
        success, data, status = self.make_request('GET', f'/products/{test_product_id}/parameters')
        self.log_test(f"GET /api/products/{test_product_id}/parameters", success or status == 404, 
                     f"Handled non-existent product parameters (status: {status})", data)
        
        # Test DELETE product parameter with non-existent ID
        success, data, status = self.make_request('DELETE', f'/products/{test_product_id}/parameters', 
                                                 params={'id': '99999'})
        self.log_test("DELETE product parameter (non-existent ID)", not success and status == 404, 
                     f"Correctly handled non-existent product parameter (status: {status})", data)
        
        # Test DELETE product parameter value with non-existent ID
        success, data, status = self.make_request('DELETE', f'/products/{test_product_id}/parameters/99999/values', 
                                                 params={'id': '99999'})
        self.log_test("DELETE product parameter value (non-existent ID)", not success and status == 404, 
                     f"Correctly handled non-existent parameter value (status: {status})", data)

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Backend API Tests for Industrial Equipment Parameter Management")
        print(f"📍 Testing against: {API_BASE}")
        print("=" * 80)
        
        try:
            # Test basic connectivity
            success, data, status = self.make_request('GET', '/families')
            if not success:
                self.log_test("API Connectivity", False, 
                             f"Cannot connect to API at {API_BASE}")
                return False
            
            # Test database migration first
            migration_success = self.test_database_migration()
            if not migration_success:
                print("⚠️  Database migration failed, but continuing with other tests")
            
            # Run family-based parameter tests
            family_id = self.test_families_api()
            if family_id:
                parameter_ids = self.test_parameters_api(family_id)
                if parameter_ids:
                    self.test_parameter_values_api(parameter_ids)
                self.test_products_by_family_api(family_id)
            
            # Get a test product ID for product-based parameter tests
            product_id = self.get_test_product_id()
            
            # Run product-based parameter tests
            if product_id:
                print(f"\n🔧 Testing Product-Based Parameter System for Product: {product_id}")
                
                # Test product parameters CRUD
                product_param_ids = self.test_product_parameters_api(product_id)
                if product_param_ids:
                    # Test product parameter values CRUD
                    self.test_product_parameter_values_api(product_id, product_param_ids)
                
                # Test different parameter types
                self.test_parameter_types(product_id)
                
                # Test required vs optional parameters
                self.test_required_vs_optional(product_id)
                
                # Test delete operations for product parameters
                self.test_delete_product_parameters(product_id)
            
            # Test error scenarios
            self.test_error_scenarios()
            
            # Cleanup family-based resources
            self.test_delete_operations()
            
        except Exception as e:
            self.log_test("Test Execution", False, f"Unexpected error: {str(e)}")
            return False
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 80)
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = APITester()
    
    try:
        # Run focused admin parameter management tests
        success = tester.run_admin_parameter_tests()
        overall_success = tester.print_summary()
        
        if overall_success:
            print("🎉 All admin parameter management tests passed successfully!")
            sys.exit(0)
        else:
            print("💥 Some admin parameter management tests failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()