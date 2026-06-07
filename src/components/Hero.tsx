'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative w-full h-[85vh] bg-gray-900 flex items-center justify-center overflow-hidden">
      
      {/* Background Video Section - Local File */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* !!! UPDATED THIS LINE: bg-black/40 changed to bg-black/60 !!! */}
      {/* Dark Overlay - Increased opacity to make video darker */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Animated Content with Updated Premium Colors */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-rose-100 tracking-[0.2em] text-sm md:text-base uppercase mb-4 shadow-black drop-shadow-md"
        >
          Timeless Elegance, Crafted for You
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-gray-50 mb-6 leading-tight drop-shadow-2xl"
        >
          Discover the Art of <br/> Fine Jewellery
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl font-light drop-shadow-md"
        >
          Explore our exclusive collection of premium artificial jewellery that brings out your inner radiance.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Link href="/collection">
            <button className="px-8 py-4 bg-rose-50 text-rose-900 font-medium tracking-wide hover:bg-rose-900 hover:text-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              EXPLORE COLLECTION
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}