import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero'; // Agar hero pehle banaya tha
import FeaturedProducts from '@/components/FeaturedProducts';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero /> 
      <FeaturedProducts />
    </main>
  );
}