import Hero from '@/components/Hero'; // Agar hero pehle banaya tha
import FeaturedProducts from '@/components/FeaturedProducts';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero /> 
      <FeaturedProducts />
    </main>
  );
}