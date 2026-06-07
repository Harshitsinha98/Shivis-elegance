'use client';
import { Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: string;
}

export default function ProductCard({ id, name, price, originalPrice, imageUrl, badge }: ProductProps) {
  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      
      {/* Product Image Box */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer">
        {/* Badge (e.g., 'New', 'Bestseller') */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 bg-rose-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
            {badge}
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm">
          <Heart className="w-5 h-5" />
        </button>

        {/* Image with Hover Zoom */}
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        {/* Quick 'Add to Cart' Overlay on Hover */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-gradient-to-t from-white/90 to-transparent">
          <button className="w-full bg-rose-900 text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-rose-800 transition">
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 text-center flex flex-col grow">
        <h3 className="text-gray-900 font-serif text-lg mb-1 cursor-pointer hover:text-rose-800 transition">
          {name}
        </h3>
        <div className="mt-auto flex items-center justify-center gap-3">
          <span className="text-rose-900 font-semibold text-lg">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-sm">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
}