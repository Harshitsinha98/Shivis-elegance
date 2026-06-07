'use client';
import { ShoppingBag } from 'lucide-react';
import { products } from '@/lib/dummyProducts';
import { useCart } from '@/context/CartContext'; // 🔴 Import

export default function FeaturedProducts() {
  const { addToCart } = useCart(); // 🔴 Hook use kiya

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Featured Collection</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <div className="relative h-80 w-full overflow-hidden bg-gray-100 rounded-lg">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => addToCart(product)} // 🔴 Click par Cart me add
                  className="w-full bg-white/90 text-gray-900 py-3 rounded flex items-center justify-center font-medium hover:bg-rose-900 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{product.category}</p>
              </div>
              <p className="text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}