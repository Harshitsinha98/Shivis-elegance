import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function PremiumProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  // Handle multiple images (Primary and Hover)
  const primaryImage = product.images?.[0] || product.image; // Fallback to old image format
  const hoverImage = product.images?.[1] || primaryImage; 

  return (
    <div className="group flex flex-col bg-white">
      {/* Image Container with Link */}
      <Link href={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-[#f8f6f3] rounded-sm block cursor-pointer">
        {/* Primary Image */}
        <img 
          src={primaryImage} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        {/* Hover/Secondary Image */}
        <img 
          src={hoverImage} 
          alt={`${product.name} alternate view`} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
        />
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-1.5 text-xs tracking-[0.2em]">SOLD OUT</span>
          </div>
        )}
      </Link>

      {/* Product Details Area */}
      <div className="pt-5 pb-2 flex flex-col items-center text-center relative">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">{product.category}</p>
        <Link href={`/product/${product.id}`} className="hover:text-rose-900 transition-colors">
          <h3 className="font-serif text-gray-900 text-sm md:text-base line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-rose-900 font-medium mt-2 tracking-wide">₹{product.price?.toLocaleString('en-IN')}</p>

        {/* Hover Add to Cart Button */}
        <button 
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          disabled={product.stock === 0}
          className="absolute -bottom-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 bg-white border border-gray-200 text-gray-900 px-6 py-2 text-xs uppercase tracking-widest hover:bg-rose-900 hover:text-white hover:border-rose-900 disabled:hidden"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}