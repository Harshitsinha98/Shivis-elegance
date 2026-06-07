import ProductCard from './ProductCard';

export default function TrendingProducts() {
  // Placeholder Data: Jab backend banega tab ye data wahan se aayega
  const products = [
    {
      id: '1',
      name: 'Rose Gold Diamond Ring',
      price: 15999,
      originalPrice: 18999,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller'
    },
    {
      id: '2',
      name: 'Emerald Tear Necklace',
      price: 22499,
      imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
      badge: 'New'
    },
    {
      id: '3',
      name: 'Classic Pearl Earrings',
      price: 8999,
      originalPrice: 10499,
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      name: 'Kundan Bridal Bangles',
      price: 34999,
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <section className="py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">Trending Collections</h2>
          <div className="w-16 h-0.5 bg-rose-800 mx-auto"></div>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Handpicked designs that our customers are loving right now. Perfect for every special occasion.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        {/* View All Button */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border border-rose-900 text-rose-900 font-medium hover:bg-rose-900 hover:text-white transition-colors duration-300">
            VIEW ALL JEWELLERY
          </button>
        </div>
      </div>
    </section>
  );
}