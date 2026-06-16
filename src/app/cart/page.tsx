'use client';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-center">Looks like you haven't added any elegant pieces yet.</p>
        <Link href="/">
          <button className="bg-rose-900 text-white px-8 py-3 rounded hover:bg-rose-800 transition">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif text-gray-900 mb-12">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items Section */}
        <div className="lg:w-2/3">
          <div className="border-b border-gray-200 pb-4 mb-6 hidden md:grid grid-cols-12 text-sm text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="space-y-8">
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-gray-100 pb-8">
                
                {/* Product Info */}
                <div className="col-span-6 flex gap-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2 md:hidden">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-3 flex items-center justify-start md:justify-center">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button onClick={() => updateQuantity(item.id, 'decrease')} className="p-2 text-gray-500 hover:text-rose-900 transition">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 'increase')} className="p-2 text-gray-500 hover:text-rose-900 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="col-span-3 flex items-center justify-between md:justify-end">
                  <span className="font-medium text-gray-900 hidden md:block">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition ml-4">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-8 rounded-lg sticky top-28">
            <h2 className="text-xl font-serif text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-2xl font-serif text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Including all taxes</p>
            </div>

            <Link href="/checkout">
              <button className="w-full bg-rose-900 text-white py-4 rounded font-medium tracking-wide hover:bg-rose-800 transition flex justify-center items-center group">
                PROCEED TO CHECKOUT
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}