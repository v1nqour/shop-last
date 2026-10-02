'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Product, ProductFamily, ProductParameter, ProductParameterValue,ProductParameterWithValues } from '@/types/product.types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productUtils';
import Image from 'next/image';
import { FiTrash2, FiX, FiPlus, FiEdit2, FiSave, FiSettings } from 'react-icons/fi';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'families'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productParameters, setProductParameters] = useState<ProductParameterWithValues[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
   const parameters: ProductParameterWithValues[] = [];
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: 'newArrivals',
    title: '',
    srcUrl: '',
    gallery: [],
    price: 0,
    specifications: [{ label: '', value: '' }],
    description: '',
    rating: 0,
    family_id: 1,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Family management states
  const [newFamily, setNewFamily] = useState({ name: '', description: '' });
  const [editingFamily, setEditingFamily] = useState<ProductFamily | null>(null);
  const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState<number | null>(null);
  
  // Product Parameter management states
  const [newParameter, setNewParameter] = useState({
    parameter_name: '',
    parameter_type: 'dropdown' as 'dropdown' | 'checkbox' | 'radio' | 'text' | 'number' | 'textarea' | 'multiselect',
    is_required: false,
    display_order: 0,
    values: [{ value_name: '', display_order: 0 }]
  });
  const [editingParameter, setEditingParameter] = useState<ProductParameter | null>(null);
  const [showDeleteParameterConfirm, setShowDeleteParameterConfirm] = useState<number | null>(null);
  
  // Parameter values management
  const [newParameterValue, setNewParameterValue] = useState({ value_name: '', display_order: 0 });
  const [editingParameterValue, setEditingParameterValue] = useState<ProductParameterValue | null>(null);
  const [selectedParameterId, setSelectedParameterId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts();
      fetchFamilies();
    }
  }, [status, session]);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductParameters(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families');
      const data = await response.json();
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  const fetchProductParameters = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/parameters`);
      const data = await response.json();
      setProductParameters(data);
    } catch (error) {
      console.error('Error fetching product parameters:', error);
    }
  };

  // Family management functions
  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFamily),
      });
      
      if (response.ok) {
        await fetchFamilies();
        setNewFamily({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding family:', error);
    }
  };

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily) return;
    
    try {
      const response = await fetch('/api/families', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFamily),
      });
      
      if (response.ok) {
        await fetchFamilies();
        setEditingFamily(null);
      }
    } catch (error) {
      console.error('Error updating family:', error);
    }
  };

  const handleDeleteFamily = async (id: number) => {
    try {
      const response = await fetch(`/api/families?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchFamilies();
        setShowDeleteFamilyConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete family');
      }
    } catch (error) {
      console.error('Error deleting family:', error);
    }
  };

  // Product Parameter management functions
  const handleAddParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    
    try {
      const response = await fetch(`/api/products/${selectedProductId}/parameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameter_name: newParameter.parameter_name,
          parameter_type: newParameter.parameter_type,
          is_required: newParameter.is_required,
          display_order: newParameter.display_order,
          values: newParameter.values.filter(v => v.value_name.trim() !== '')
        }),
      });
      
      if (response.ok) {
        await fetchProductParameters(selectedProductId);
        setNewParameter({
          parameter_name: '',
          parameter_type: 'dropdown',
          is_required: false,
          display_order: 0,
          values: [{ value_name: '', display_order: 0 }]
        });
      }
    } catch (error) {
      console.error('Error adding parameter:', error);
    }
  };

  const handleUpdateParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParameter || !selectedProductId) return;
    
    try {
      const response = await fetch(`/api/products/${selectedProductId}/parameters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingParameter),
      });
      
      if (response.ok) {
        await fetchProductParameters(selectedProductId);
        setEditingParameter(null);
      }
    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  };

  const handleDeleteParameter = async (parameterId: number) => {
    if (!selectedProductId) return;
    
    try {
      const response = await fetch(`/api/products/${selectedProductId}/parameters?id=${parameterId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchProductParameters(selectedProductId);
        setShowDeleteParameterConfirm(null);
      } else {
        console.error('Failed to delete parameter:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting parameter:', error);
    }
  };

  // Parameter value management functions
  const handleAddParameterValue = async (parameterId: number) => {
    if (!selectedProductId) return;
    
    try {
      const response = await fetch(`/api/products/${selectedProductId}/parameters/${parameterId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParameterValue),
      });
      
      if (response.ok) {
        await fetchProductParameters(selectedProductId);
        setNewParameterValue({ value_name: '', display_order: 0 });
        setSelectedParameterId(null);
      }
    } catch (error) {
      console.error('Error adding parameter value:', error);
    }
  };

  const handleAddParameterValueField = () => {
    setNewParameter(prev => ({
      ...prev,
      values: [...prev.values, { value_name: '', display_order: prev.values.length }]
    }));
  };

  const handleRemoveParameterValueField = (index: number) => {
    setNewParameter(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleParameterValueChange = (index: number, value: string) => {
    setNewParameter(prev => ({
      ...prev,
      values: prev.values.map((v, i) => 
        i === index ? { ...v, value_name: value } : v
      )
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const files = Array.from(e.target.files);
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      const invalidFiles = files.filter(
        file => !validTypes.includes(file.type) || file.size > maxSize
      );

      if (invalidFiles.length > 0) {
        alert('Some files were invalid. Please use JPEG, PNG, or WebP under 10MB.');
        return;
      }

      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };
      xhr.open('POST', '/api/upload-images');
      xhr.responseType = 'json';

      const urls = await new Promise<string[]>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response.urls);
          } else {
            reject(new Error(`Image upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      setNewProduct(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...urls],
        srcUrl: prev.srcUrl || urls[0],
      }));
    } catch (error) {
      alert('Failed to upload images. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedGallery = [...(newProduct.gallery || [])];
    updatedGallery.splice(index, 1);

    setNewProduct(prev => ({
      ...prev,
      gallery: updatedGallery,
      srcUrl: prev.srcUrl === updatedGallery[index] ? '' : prev.srcUrl,
    }));
  };

  const handleAddSpecification = () => {
    setNewProduct(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { label: '', value: '' }],
    }));
  };

  const handleSpecificationChange = (index: number, field: 'label' | 'value', val: string) => {
    const updatedSpecs = [...(newProduct.specifications || [])];
    updatedSpecs[index][field] = val;

    setNewProduct(prev => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  const removeSpecification = (index: number) => {
    const updatedSpecs = [...(newProduct.specifications || [])];
    updatedSpecs.splice(index, 1);

    setNewProduct(prev => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newProduct.title || !newProduct.category) {
        throw new Error('Title and category are required');
      }

      const productToAdd = {
        ...newProduct,
        price: newProduct.disablePrice ? 0 : Number(newProduct.price),
        rating: Number(newProduct.rating),
        gallery: newProduct.gallery || [],
        specifications: newProduct.specifications?.filter(spec => spec.label && spec.value) || [],
      };

      const result = await addProduct(productToAdd as Omit<Product, 'id'>);
      console.log('Add product result:', result);
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Add product error:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const updatedProduct = {
        ...editingProduct,
        ...newProduct,
        price: newProduct.disablePrice ? 0 : Number(newProduct.price),
        rating: Number(newProduct.rating),
        gallery: newProduct.gallery || [],
        specifications: newProduct.specifications?.filter(spec => spec.label && spec.value) || [],
        disablePrice: newProduct.disablePrice || false,
      };

      await updateProduct(editingProduct.id, updatedProduct); // id is string
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => { // Changed to string
    try {
      const wasDeleted = await deleteProduct(id);
      
      if (wasDeleted) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setShowDeleteConfirm(null);
      } else {
        await fetchProducts();
        alert('Product not found - the list has been refreshed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setNewProduct({
      category: 'newArrivals',
      title: '',
      srcUrl: '',
      gallery: [],
      price: 0,
      specifications: [{ label: '', value: '' }],
      description: '',
      rating: 0,
      disablePrice: false,
      family_id: 1,
    });
    setEditingProduct(null);
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      specifications: product.specifications?.length ? product.specifications : [{ label: '', value: '' }],
    });
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin - Manage Products</h1>
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            Log Out
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 rounded transition ${
            activeTab === 'products' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('families')}
          className={`py-2 px-4 rounded transition ${
            activeTab === 'families' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Families
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div>
          {/* Parameter Management Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Manage Parameters</h2>
            
            {/* Product Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Select Product to Manage Parameters</label>
              <select
                value={selectedProductId || ''}
                onChange={e => setSelectedProductId(e.target.value || null)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
              
              {/* Product Preview */}
              {selectedProductId && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const selectedProduct = products.find(p => p.id === selectedProductId);
                    if (!selectedProduct) return null;
                    
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedProduct.srcUrl}
                            alt={selectedProduct.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{selectedProduct.title}</h4>
                          <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {selectedProductId && (
              <>
                {/* Add/Edit Parameter Form */}
                <form onSubmit={editingParameter ? handleUpdateParameter : handleAddParameter} className="mb-8 p-6 border rounded-lg shadow bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium">Parameter Name</label>
                      <input
                        type="text"
                        value={editingParameter ? editingParameter.parameter_name : newParameter.parameter_name}
                        onChange={e => {
                          if (editingParameter) {
                            setEditingParameter({ ...editingParameter, parameter_name: e.target.value });
                          } else {
                            setNewParameter({ ...newParameter, parameter_name: e.target.value });
                          }
                        }}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium">Parameter Type</label>
                      <select
                        value={editingParameter ? editingParameter.parameter_type : newParameter.parameter_type}
                        onChange={e => {
                          const value = e.target.value as 'dropdown' | 'checkbox' | 'radio' | 'text' | 'number' | 'textarea' | 'multiselect';
                          if (editingParameter) {
                            setEditingParameter({ ...editingParameter, parameter_type: value });
                          } else {
                            setNewParameter({ ...newParameter, parameter_type: value });
                          }
                        }}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="dropdown">Dropdown (single select)</option>
                        <option value="multiselect">Multi-select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio buttons</option>
                        <option value="text">Text input</option>
                        <option value="number">Number input</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium">Display Order</label>
                      <input
                        type="number"
                        value={editingParameter ? editingParameter.display_order : newParameter.display_order}
                        onChange={e => {
                          if (editingParameter) {
                            setEditingParameter({ ...editingParameter, display_order: Number(e.target.value) });
                          } else {
                            setNewParameter({ ...newParameter, display_order: Number(e.target.value) });
                          }
                        }}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRequired"
                        checked={editingParameter ? editingParameter.is_required : newParameter.is_required}
                        onChange={e => {
                          if (editingParameter) {
                            setEditingParameter({ ...editingParameter, is_required: e.target.checked });
                          } else {
                            setNewParameter({ ...newParameter, is_required: e.target.checked });
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="isRequired" className="font-medium">Required Parameter</label>
                    </div>
                  </div>

                  {/* Parameter Values Section (for dropdown, multiselect, checkbox, radio types) */}
                  {!editingParameter && ['dropdown', 'multiselect', 'checkbox', 'radio'].includes(newParameter.parameter_type) && (
                    <div className="mt-6">
                      <label className="block mb-2 font-medium">Parameter Values</label>
                      <div className="space-y-2">
                        {newParameter.values.map((value, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={value.value_name}
                              onChange={(e) => handleParameterValueChange(index, e.target.value)}
                              placeholder="Value name"
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveParameterValueField(index)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                              disabled={newParameter.values.length === 1}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddParameterValueField}
                          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center gap-2"
                        >
                          <FiPlus size={16} />
                          Add Another Value
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 mt-6">
                    {editingParameter && (
                      <button
                        type="button"
                        onClick={() => setEditingParameter(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
                    >
                      {editingParameter ? 'Update Parameter' : 'Add Parameter'}
                    </button>
                  </div>
                </form>

                {/* Parameter List */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold">Current Parameters</h3>
                  {productParameters.map(parameter => (
                    <div key={parameter.id} className="p-4 border rounded-lg shadow-sm bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium">{parameter.parameter_name}</h4>
                          <p className="text-gray-600">Type: {parameter.parameter_type}</p>
                          <p className="text-gray-600">Required: {parameter.is_required ? 'Yes' : 'No'}</p>
                          <p className="text-gray-600">Order: {parameter.display_order}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingParameter(parameter)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteParameterConfirm(parameter.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Parameter Values */}
                      <div>
                        <h5 className="font-medium mb-2">Values:</h5>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {parameter.values?.map(value => (
                            <span key={value.id} className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {value.value_name}
                            </span>
                          ))}
                        </div>
                        
                        {/* Add Value Form */}
                        {selectedParameterId === parameter.id ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newParameterValue.value_name}
                              onChange={e => setNewParameterValue({ ...newParameterValue, value_name: e.target.value })}
                              placeholder="Value name"
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleAddParameterValue(parameter.id)}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition"
                            >
                              <FiSave size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedParameterId(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedParameterId(parameter.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition mt-2"
                          >
                            <FiPlus size={16} className="inline mr-1" />
                            Add Value
                          </button>
                        )}
                      </div>

                      {/* Delete Parameter Confirmation */}
                      {showDeleteParameterConfirm === parameter.id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                            <p className="mb-6">Are you sure you want to delete "{parameter.parameter_name}"?</p>
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setShowDeleteParameterConfirm(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteParameter(parameter.id)}
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Form for Adding/Updating Product */}
          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mb-8 p-6 border rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{editingProduct ? 'Update Product' : 'Add New Product'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family Selection */}
              <div>
                <label className="block mb-2 font-medium">Product Family</label>
                <select
                  value={newProduct.family_id || ''}
                  onChange={e => setNewProduct({ ...newProduct, family_id: Number(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a family</option>
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 font-medium">Category</label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newArrivals">New Arrivals</option>
                  <option value="topSelling">Top Selling</option>
                  <option value="relatedProducts">Produits similaires</option>
                </select>
              </div>

              {/* Title */}
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Product Images</label>

                {/* Image Previews */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {newProduct.srcUrl && (
                    <div className="relative group">
                      <div className="relative h-24 w-24">
                        <Image
                          src={newProduct.srcUrl}
                          alt="Main product image"
                          fill
                          className="rounded border object-cover"
                          sizes="100px"
                        />
                      </div>
                      <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-1 rounded">Main</span>
                      <button
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, srcUrl: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}

                  {[...(newProduct.gallery || [])]
                    .sort((a, b) => (a === newProduct.srcUrl ? -1 : b === newProduct.srcUrl ? 1 : 0))
                    .map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-24 w-24">
                          <Image
                            src={img}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="rounded border object-cover"
                            sizes="100px"
                          />
                        </div>
                        {img === newProduct.srcUrl && (
                          <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-1 rounded">Main</span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 transition">
                          {img !== newProduct.srcUrl && (
                            <button
                              type="button"
                              onClick={() => setNewProduct(prev => ({ ...prev, srcUrl: img }))}
                              className="text-white bg-blue-500 p-1 rounded"
                              title="Set as main"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(newProduct.gallery!.indexOf(img))}
                            className="text-white bg-red-500 p-1 rounded"
                            title="Remove"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Upload Button and Progress */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded flex items-center gap-2 transition"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                    <FiPlus />
                  </button>

                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    multiple
                  />
                </div>
              </div>

              {/* Price Section */}
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Price Settings</label>
                <div className="flex gap-4 items-center mb-4">
                  <select
                    value={newProduct.disablePrice ? 'disabled' : 'enabled'}
                    onChange={e => {
                      const isDisabled = e.target.value === 'disabled';
                      setNewProduct({
                        ...newProduct,
                        disablePrice: isDisabled,
                        price: isDisabled ? 0 : newProduct.price,
                      });
                    }}
                    className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="enabled">Show Price</option>
                    <option value="disabled">Contact for Pricing</option>
                  </select>

                  {newProduct.disablePrice ? (
                    <p className="text-gray-600 italic">Price will be hidden. Customers will see: "Contact us for pricing details"</p>
                  ) : null}
                </div>

                {!newProduct.disablePrice && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium">Starting Price (MAD)</label>
                      <div className="flex items-center border rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                        <span className="px-3 text-gray-500">MAD</span>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="w-full p-2 outline-none"
                          required
                          step="1"
                          min="0"
                          placeholder="Starting price"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Will be displayed as "À partir de MAD {newProduct.price || 0}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block mb-2 font-medium">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProduct.rating}
                  onChange={e => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  max="5"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              {/* Specifications */}
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Specifications</label>
                <div className="space-y-3">
                  {newProduct.specifications?.map((spec, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Label"
                        value={spec.label}
                        onChange={e => handleSpecificationChange(index, 'label', e.target.value)}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={spec.value}
                        onChange={e => handleSpecificationChange(index, 'value', e.target.value)}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-2"
                  >
                    <FiPlus size={16} />
                    Add Specification
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>

          {/* Product List */}
          <h2 className="text-xl font-semibold mb-4">Product List</h2>
          <div className="grid grid-cols-1 gap-4">
            {products.map(product => (
              <div key={product.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  {product.srcUrl && (
                    <Image
                      src={product.srcUrl}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="rounded border object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{product.title}</h3>
                    <p className="text-gray-600">Family: {product.family?.name || 'No family'}</p>
                    <p className="text-gray-600">Category: {product.category}</p>
                    <p className="text-gray-600">
                      Price: {product.disablePrice ? 'Contact for pricing' : `À partir de MAD ${product.price}`}
                    </p>
                    <p className="text-gray-600">Rating: {product.rating}/5</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(product)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                  >
                    Delete
                  </button>

                  {showDeleteConfirm === product.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete "{product.title}"?</p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family Management Tab */}
      {activeTab === 'families' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Product Families</h2>
          
          {/* Add/Edit Family Form */}
          <form onSubmit={editingFamily ? handleUpdateFamily : handleAddFamily} className="mb-8 p-6 border rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{editingFamily ? 'Edit Family' : 'Add New Family'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">Family Name</label>
                <input
                  type="text"
                  value={editingFamily ? editingFamily.name : newFamily.name}
                  onChange={e => {
                    if (editingFamily) {
                      setEditingFamily({ ...editingFamily, name: e.target.value });
                    } else {
                      setNewFamily({ ...newFamily, name: e.target.value });
                    }
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  value={editingFamily ? editingFamily.description : newFamily.description}
                  onChange={e => {
                    if (editingFamily) {
                      setEditingFamily({ ...editingFamily, description: e.target.value });
                    } else {
                      setNewFamily({ ...newFamily, description: e.target.value });
                    }
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {editingFamily && (
                <button
                  type="button"
                  onClick={() => setEditingFamily(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
              >
                {editingFamily ? 'Update Family' : 'Add Family'}
              </button>
            </div>
          </form>

          {/* Family List */}
          <div className="grid grid-cols-1 gap-4">
            {families.map(family => (
              <div key={family.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="text-lg font-medium">{family.name}</h3>
                  <p className="text-gray-600">{family.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFamily(family)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteFamilyConfirm(family.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {showDeleteFamilyConfirm === family.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to delete "{family.name}"?</p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowDeleteFamilyConfirm(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteFamily(family.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}