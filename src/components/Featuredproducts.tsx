'use client';
import { ShoppingBag } from 'lucide-react';
import { products } from '@/lib/dummyProducts';

export default function FeaturedProducts() {
  const handleAddToCart = (productName: string) => {
    // Ye function hum agle step mein Cart Context ke sath link karenge
    console.log(`Added ${productName} to cart!`);
    alert(`${productName} added to cart!`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Featured Collection</h2>
          <p className="text-gray-500 mt-2">Handcrafted elegance for your special moments</p>
        </div>
        <button className="text-rose-900 font-medium hover:underline hidden md:block">
          View All Products
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            {/* Image Container */}
            <div className="relative h-80 w-full overflow-hidden bg-gray-100 rounded-lg">
              {product.tag && (
                <span className="absolute top-3 left-3 bg-white px-3 py-1 text-xs font-bold tracking-wider uppercase text-gray-900 z-10 rounded-sm shadow-sm">
                  {product.tag}
                </span>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Quick Add Button (Hover) */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleAddToCart(product.name)}
                  className="w-full bg-white/90 backdrop-blur-sm text-gray-900 py-3 rounded flex items-center justify-center font-medium hover:bg-rose-900 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700 font-medium">{product.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{product.category}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}