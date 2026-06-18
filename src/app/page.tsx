'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <div className="bg-rose-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Shivi's Elegance</h1>
        <p className="text-rose-100 max-w-2xl mx-auto text-lg md:text-xl font-light">
          Discover our exclusive collection of handcrafted jewellery. Elegance designed just for you.
        </p>
      </div>

      {/* Product Grid Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-4">
          <h2 className="text-3xl font-serif text-gray-900">Latest Arrivals</h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 text-gray-500 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">Store is currently empty</p>
            <p className="text-sm mt-1">Admin needs to add products from the dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                      Only {product.stock} left
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-gray-900 text-white px-4 py-2 rounded font-medium tracking-wider text-sm">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-rose-900 font-semibold mb-1 uppercase tracking-wider">{product.category}</p>
                    <h3 className="font-medium text-gray-900 truncate" title={product.name}>{product.name}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <p className="text-lg font-serif text-gray-900 font-medium">₹{product.price?.toLocaleString('en-IN')}</p>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-900 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}