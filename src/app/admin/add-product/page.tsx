'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Package, Image as ImageIcon, Barcode } from 'lucide-react';

export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', stock: '10', sku: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        stock: Number(product.stock),
        sku: product.sku.toUpperCase(), // SKU hamesha capital me save hoga
        createdAt: serverTimestamp()
      });
      alert('Product Added Successfully! 🎉');
      setProduct({ name: '', price: '', category: '', image: '', description: '', stock: '10', sku: '' });
    } catch (error) {
      console.error("Error adding product: ", error);
      alert('Failed to add product.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
        <div className="bg-rose-100 p-2.5 rounded-lg text-rose-900">
          <Plus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Upload a new jewellery item with SKU.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input required type="text" name="name" value={product.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white" placeholder="e.g. Rose Gold Diamond Ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Barcode className="w-4 h-4" /> SKU (Stock Keeping Unit)
            </label>
            <input required type="text" name="sku" value={product.sku} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white uppercase" placeholder="e.g. RG-RING-001" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
            <input required type="number" name="price" value={product.price} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white" placeholder="e.g. 15999" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select required name="category" value={product.category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white">
              <option value="">Select Category</option>
              <option value="Rings">Rings</option>
              <option value="Earrings">Earrings</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Bracelets">Bracelets</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
            <input required type="number" name="stock" value={product.stock} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Image URL
            </label>
            <input required type="url" name="image" value={product.image} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white" placeholder="https://images.unsplash.com/..." />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Description</label>
            <textarea required name="description" value={product.description} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white" placeholder="Enter details..."></textarea>
          </div>
        
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={loading} className="bg-rose-900 text-white px-8 py-3.5 rounded-lg font-medium tracking-wide hover:bg-rose-800 transition-all disabled:opacity-60 flex items-center gap-2 shadow-md">
            <Package className="w-5 h-5" />
            {loading ? 'SAVING...' : 'PUBLISH PRODUCT'}
          </button>
        </div>
      </form>
    </div>
  );
}