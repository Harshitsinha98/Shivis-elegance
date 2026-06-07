import Hero from '@/components/Hero'; 
import FeaturedProducts from '@/components/FeaturedProducts';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Purana Hero Section */}
      <Hero /> 

      {/* Purana Categories Section (Wapas aa gaya) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/shop/necklaces" className="group relative h-[400px] overflow-hidden rounded-lg">
            <img src="https://images.unsplash.com/photo-1599643478524-fb66f7ca065b?w=800&q=80" alt="Necklaces" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-serif text-white tracking-widest">NECKLACES</h2>
            </div>
          </Link>
          <div className="grid grid-rows-2 gap-8">
            <Link href="/shop/rings" className="group relative h-[184px] overflow-hidden rounded-lg">
              <img src="https://images.unsplash.com/photo-1605100804763-247f66122c94?w=800&q=80" alt="Rings" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-2xl font-serif text-white tracking-widest">RINGS</h2>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-8 h-[184px]">
              <Link href="/shop/earrings" className="group relative overflow-hidden rounded-lg">
                <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80" alt="Earrings" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-xl font-serif text-white tracking-widest">EARRINGS</h2>
                </div>
              </Link>
              <Link href="/shop/bracelets" className="group relative overflow-hidden rounded-lg">
                <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80" alt="Bracelets" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-xl font-serif text-white tracking-widest">BRACELETS</h2>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products List */}
      <FeaturedProducts />
    </main>
  );
}