'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Package, Image as ImageIcon } from 'lucide-react';

export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', stock: '10'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Firebase 'products' collection mein data save kar rahe hain
      await addDoc(collection(db, 'products'), {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        stock: Number(product.stock),
        createdAt: serverTimestamp()
      });
      alert('Product Added Successfully! 🎉');
      // Form ko wapas empty kar rahe hain
      setProduct({ name: '', price: '', category: '', image: '', description: '', stock: '10' });
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
          <p className="text-sm text-gray-500 mt-1">Upload a new jewellery item to your store's database.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input required type="text" name="name" value={product.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Rose Gold Diamond Ring" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
            <input required type="number" name="price" value={product.price} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 15999" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select required name="category" value={product.category} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors">
              <option value="">Select Category</option>
              <option value="Rings">Rings</option>
              <option value="Earrings">Earrings</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Bracelets">Bracelets</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
            <input required type="number" name="stock" value={product.stock} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Image URL
            </label>
            <input required type="url" name="image" value={product.image} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="https://images.unsplash.com/..." />
            <p className="text-xs text-gray-500 mt-1.5">Paste a direct image link (e.g., from Unsplash). In the future, we will add an image upload button here.</p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Description</label>
            <textarea required name="description" value={product.description} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-200 rounded-lg focus:border-rose-900 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Enter details like material, karat, weight, etc..."></textarea>
          </div>
        
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={loading} className="bg-rose-900 text-white px-8 py-3.5 rounded-lg font-medium tracking-wide hover:bg-rose-800 transition-all disabled:opacity-60 flex items-center gap-2 shadow-md hover:shadow-lg">
            <Package className="w-5 h-5" />
            {loading ? 'SAVING PRODUCT...' : 'PUBLISH PRODUCT'}
          </button>
        </div>
      </form>
    </div>
  );
}