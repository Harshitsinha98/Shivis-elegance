import Hero from '@/components/Hero';
import ShopByCategory from '@/components/ShopByCategory';
import TrendingProducts from '@/components/TrendingProducts';
import PerfectMatch from '@/components/PerfectMatch';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Main Video Banner */}
      <Hero />
      
      {/* 2. Category Navigation (Tall rounded cards) */}
      <ShopByCategory />
      
      {/* 3. The Big Catalogue Grid (50 Products Concept) */}
      <TrendingProducts />
      
      {/* 4. The Gifting / Perfect Match Banner */}
      <PerfectMatch />
    </div>
  );
}
