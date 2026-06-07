'use client';
import Link from 'next/link';

export default function ShopByCategory() {
  const categories = [
    { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
    { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Bangles & Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">Shop By Category</h2>
          <div className="w-16 h-0.5 bg-rose-800 mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat, index) => (
            <Link href={`/category/${cat.name.toLowerCase()}`} key={index} className="group cursor-pointer flex flex-col items-center">
              <div className="relative w-full aspect-[4/5] rounded-t-full overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                {/* Subtle dark gradient at the bottom of the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-serif text-lg text-gray-800 group-hover:text-rose-800 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}