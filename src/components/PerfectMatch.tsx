'use client';
import Link from 'next/link';

export default function PerfectMatch() {
  return (
    <section className="py-16 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center bg-rose-900 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Image Section */}
          <div className="w-full lg:w-1/2 h-80 lg:h-[500px] relative">
            <img 
              src="https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=1000&auto=format&fit=crop" 
              alt="Perfect Match Jewellery" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 text-center lg:text-left flex flex-col justify-center">
            <p className="text-rose-200 tracking-[0.2em] text-sm uppercase mb-3">Gifting Made Easy</p>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
              Find Your <br/> Perfect Match
            </h2>
            <p className="text-rose-100/80 text-lg mb-8 font-light max-w-md mx-auto lg:mx-0">
              Whether it's an anniversary, a birthday, or just to say "I love you", discover pieces that speak directly to the heart.
            </p>
            <div>
              <Link href="/gifts">
                <button className="px-8 py-3 bg-white text-rose-900 font-medium tracking-wide hover:bg-rose-50 hover:scale-105 transition-all duration-300">
                  SHOP GIFTS
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}