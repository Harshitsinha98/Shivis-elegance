'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import PremiumProductCard from '@/components/PremiumProductCard';
import Hero from '@/components/Hero'; // Agar aapka Hero component ready hai

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Filter products based on the "Section" selected by Admin
  const bestSellers = products.filter(p => p.displaySection === 'Best Selling').slice(0, 4);
  const featured = products.filter(p => p.displaySection === 'Featured').slice(0, 4);
  const standardProducts = products.filter(p => !p.displaySection || p.displaySection === 'Standard').slice(0, 4);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><div className="w-8 h-8 border-2 border-rose-900 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7]"> {/* Cream/Off-white premium background */}
      
      <Hero /> 

      {/* 1. BEST SELLERS SECTION */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20 border-b border-gray-200/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Bestsellers</h2>
            <div className="w-16 h-px bg-rose-900 mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map(product => <PremiumProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {/* 2. ORIGINAL CATEGORIES SECTION (Refined) */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Shop by Category</h2>
          <div className="w-16 h-px bg-rose-900 mx-auto mt-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <Link href="/shop/necklaces" className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-sm">
            <img src="https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800&q=80" alt="Necklaces" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-serif text-white tracking-[0.2em] mb-3">NECKLACES</h2>
              <span className="text-white border-b border-white pb-1 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">EXPLORE</span>
            </div>
          </Link>
          <div className="grid grid-rows-2 gap-4 md:gap-8">
            <Link href="/shop/rings" className="group relative h-[192px] md:h-[234px] overflow-hidden rounded-sm">
              <img src="https://images.unsplash.com/photo-1605100804763-247f66122c94?w=800&q=80" alt="Rings" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif text-white tracking-[0.2em] mb-2">RINGS</h2>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-4 md:gap-8 h-[192px] md:h-[234px]">
              <Link href="/shop/earrings" className="group relative overflow-hidden rounded-sm">
                <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80" alt="Earrings" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-serif text-white tracking-[0.1em]">EARRINGS</h2>
                </div>
              </Link>
              <Link href="/shop/bracelets" className="group relative overflow-hidden rounded-sm">
                <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80" alt="Bracelets" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-serif text-white tracking-[0.1em]">BRACELETS</h2>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION SECTION */}
      {featured.length > 0 && (
        <section className="bg-white py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Featured Collection</h2>
              <div className="w-16 h-px bg-rose-900 mx-auto mt-6"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map(product => <PremiumProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* 4. GIFTS FOR OCCASION BANNER */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-rose-900 text-white rounded-sm overflow-hidden flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-12 text-center md:text-left">
            <p className="text-sm tracking-[0.3em] text-rose-200 mb-4 uppercase">The Perfect Present</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Gifts for Every<br/>Occasion</h2>
            <p className="font-light text-rose-100 mb-8 max-w-md">Celebrate her special moments with handcrafted elegance that lasts a lifetime.</p>
            <Link href="/shop" className="inline-block border border-white px-8 py-3 tracking-widest text-sm hover:bg-white hover:text-rose-900 transition-colors">
              SHOP GIFTS
            </Link>
          </div>
          <div className="w-full md:w-1/2 h-[400px]">
            <img src="https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=1000" alt="Gifting" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

    </main>
  );
}