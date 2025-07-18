#!/usr/bin/env python3
"""
Backend API Testing for Product Families Navigation System
Tests the families navigation system specifically focusing on:
1. /api/families endpoint
2. /api/products/by-family endpoint
3. Database connectivity
4. Family detail retrieval functionality
"""

import requests
import json
import sys
import os
from typing import Dict, Any, List, Optional

# Use the production URL from .env.local
BASE_URL = "https://shop.approvisionneur.com"
API_BASE = f"{BASE_URL}/api"

class FamiliesNavigationTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []

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

    def test_families_endpoint(self):
        """Test the /api/families endpoint to ensure it returns product families data"""
        print("\n=== Testing /api/families Endpoint ===")
        
        # Test GET /api/families
        success, data, status = self.make_request('GET', '/families')
        self.log_test("GET /api/families", success, 
                     f"Fetched families list (status: {status})", data)
        
        if not success:
            return False, None
        
        # Validate response structure
        if isinstance(data, list):
            self.log_test("Families Response Format", True, 
                         f"Returned {len(data)} families in correct array format")
            
            # Check if we have families data
            if len(data) > 0:
                family = data[0]
                required_fields = ['id', 'name']
                has_required_fields = all(field in family for field in required_fields)
                self.log_test("Family Data Structure", has_required_fields,
                             f"Family object has required fields: {list(family.keys())}")
                
                # Log family details for debugging
                print(f"   Sample family: ID={family.get('id')}, Name='{family.get('name')}'")
                
                return True, data
            else:
                self.log_test("Families Data", False, "No families found in database")
                return False, None
        else:
            self.log_test("Families Response Format", False, 
                         f"Expected array, got {type(data)}")
            return False, None

    def test_products_by_family_endpoint(self, families_data):
        """Test the /api/products/by-family endpoint with valid family IDs"""
        print("\n=== Testing /api/products/by-family Endpoint ===")
        
        if not families_data or len(families_data) == 0:
            self.log_test("Products by Family Test", False, "No families available for testing")
            return False
        
        # Test with first family
        family = families_data[0]
        family_id = family.get('id')
        family_name = family.get('name', 'Unknown')
        
        print(f"   Testing with Family ID: {family_id} ('{family_name}')")
        
        # Test GET /api/products/by-family with familyId parameter
        success, data, status = self.make_request('GET', '/products/by-family', 
                                                 params={'familyId': family_id})
        self.log_test(f"GET /api/products/by-family?familyId={family_id}", success, 
                     f"Fetched products for family '{family_name}' (status: {status})", data)
        
        if not success:
            return False
        
        # Validate response structure
        if isinstance(data, list):
            self.log_test("Products by Family Response Format", True, 
                         f"Returned {len(data)} products in correct array format")
            
            # If products exist, validate their structure
            if len(data) > 0:
                product = data[0]
                required_fields = ['id', 'title', 'name']
                has_required_fields = all(field in product for field in required_fields)
                self.log_test("Product Data Structure", has_required_fields,
                             f"Product object has required fields: {list(product.keys())}")
                
                # Check if family information is included
                if 'family' in product and product['family']:
                    family_info = product['family']
                    self.log_test("Product Family Information", True,
                                 f"Product includes family info: {family_info.get('name')}")
                else:
                    self.log_test("Product Family Information", False,
                                 "Product missing family information")
                
                # Log product details
                print(f"   Sample product: ID={product.get('id')}, Title='{product.get('title')}'")
            else:
                self.log_test("Products Data", True, 
                             f"No products found for family '{family_name}' (this is acceptable)")
            
            return True
        else:
            self.log_test("Products by Family Response Format", False, 
                         f"Expected array, got {type(data)}")
            return False

    def test_missing_family_id_parameter(self):
        """Test /api/products/by-family endpoint without familyId parameter"""
        print("\n=== Testing /api/products/by-family Without familyId Parameter ===")
        
        # Test GET /api/products/by-family without familyId parameter
        success, data, status = self.make_request('GET', '/products/by-family')
        
        # This should fail with 400 status
        expected_failure = not success and status == 400
        self.log_test("GET /api/products/by-family (no familyId)", expected_failure, 
                     f"Correctly rejected request without familyId (status: {status})", data)
        
        return expected_failure

    def test_invalid_family_id(self):
        """Test /api/products/by-family endpoint with invalid family ID"""
        print("\n=== Testing /api/products/by-family With Invalid Family ID ===")
        
        # Test with non-existent family ID
        invalid_family_id = 99999
        success, data, status = self.make_request('GET', '/products/by-family', 
                                                 params={'familyId': invalid_family_id})
        
        # This should succeed but return empty array
        if success and isinstance(data, list) and len(data) == 0:
            self.log_test(f"GET /api/products/by-family?familyId={invalid_family_id}", True, 
                         f"Correctly returned empty array for invalid family ID (status: {status})")
            return True
        else:
            self.log_test(f"GET /api/products/by-family?familyId={invalid_family_id}", False, 
                         f"Unexpected response for invalid family ID (status: {status})", data)
            return False

    def test_database_connectivity(self):
        """Test database connection by attempting to fetch families"""
        print("\n=== Testing Database Connectivity ===")
        
        # The families endpoint uses direct database queries, so if it works, DB is connected
        success, data, status = self.make_request('GET', '/families')
        
        if success:
            self.log_test("Database Connectivity", True, 
                         "Database connection working - families endpoint responded successfully")
            return True
        else:
            self.log_test("Database Connectivity", False, 
                         f"Database connection failed - families endpoint error (status: {status})", data)
            return False

    def test_family_detail_retrieval(self, families_data):
        """Test family detail retrieval functionality"""
        print("\n=== Testing Family Detail Retrieval ===")
        
        if not families_data or len(families_data) == 0:
            self.log_test("Family Detail Retrieval", False, "No families available for testing")
            return False
        
        # Test multiple families if available
        families_tested = 0
        successful_retrievals = 0
        
        for family in families_data[:3]:  # Test up to 3 families
            family_id = family.get('id')
            family_name = family.get('name', 'Unknown')
            
            print(f"   Testing family detail retrieval for: {family_id} ('{family_name}')")
            
            # Test products retrieval for this family
            success, products_data, status = self.make_request('GET', '/products/by-family', 
                                                             params={'familyId': family_id})
            
            if success:
                successful_retrievals += 1
                self.log_test(f"Family {family_id} Detail Retrieval", True,
                             f"Successfully retrieved {len(products_data) if isinstance(products_data, list) else 0} products")
            else:
                self.log_test(f"Family {family_id} Detail Retrieval", False,
                             f"Failed to retrieve products (status: {status})", products_data)
            
            families_tested += 1
        
        # Overall assessment
        success_rate = successful_retrievals / families_tested if families_tested > 0 else 0
        overall_success = success_rate >= 0.8  # 80% success rate threshold
        
        self.log_test("Overall Family Detail Retrieval", overall_success,
                     f"Successfully retrieved details for {successful_retrievals}/{families_tested} families ({success_rate:.1%})")
        
        return overall_success

    def run_all_tests(self):
        """Run all Product Families navigation system tests"""
        print("🔧 Starting Product Families Navigation System Tests")
        print("=" * 60)
        
        all_tests_passed = True
        
        # Test 1: /api/families endpoint
        families_success, families_data = self.test_families_endpoint()
        if not families_success:
            all_tests_passed = False
        
        # Test 2: /api/products/by-family endpoint with valid family ID
        if families_data:
            products_success = self.test_products_by_family_endpoint(families_data)
            if not products_success:
                all_tests_passed = False
        else:
            self.log_test("Products by Family Test", False, "Skipped due to no families data")
            all_tests_passed = False
        
        # Test 3: Database connectivity
        db_success = self.test_database_connectivity()
        if not db_success:
            all_tests_passed = False
        
        # Test 4: Family detail retrieval functionality
        if families_data:
            detail_success = self.test_family_detail_retrieval(families_data)
            if not detail_success:
                all_tests_passed = False
        else:
            self.log_test("Family Detail Retrieval", False, "Skipped due to no families data")
            all_tests_passed = False
        
        # Test 5: Error handling tests
        missing_param_success = self.test_missing_family_id_parameter()
        invalid_id_success = self.test_invalid_family_id()
        
        if not missing_param_success or not invalid_id_success:
            all_tests_passed = False
        
        # Summary
        print("\n" + "=" * 60)
        print("🔧 Product Families Navigation System Test Summary")
        print("=" * 60)
        
        passed_tests = sum(1 for result in self.test_results if result['success'])
        total_tests = len(self.test_results)
        success_rate = passed_tests / total_tests if total_tests > 0 else 0
        
        print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1%})")
        
        if all_tests_passed and success_rate >= 0.8:
            print("✅ OVERALL RESULT: Product Families Navigation System is WORKING")
            return True
        else:
            print("❌ OVERALL RESULT: Product Families Navigation System has ISSUES")
            
            # Print failed tests
            failed_tests = [result for result in self.test_results if not result['success']]
            if failed_tests:
                print("\nFailed Tests:")
                for test in failed_tests:
                    print(f"  - {test['test']}: {test['message']}")
            
            return False


def main():
    """Main test execution"""
    tester = FamiliesNavigationTester()
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()