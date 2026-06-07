'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Search } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoginModal from './LoginModal';
import AccountDropdown from './AccountDropdown';
import { useCart } from '@/context/CartContext'; // 🔴 Cart Context Import

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // 🔴 Cart Count Context se fetch ho raha hai
  const { cartCount } = useCart(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (docSnap.exists()) {
            setUserName(docSnap.data().firstName);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setUserName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <nav className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-serif text-rose-900 tracking-wider">Shivi's Elegance</h1>
              </Link>
            </div>

            {/* Navigation Categories */}
            <div className="hidden md:flex space-x-8 text-gray-700 font-medium text-sm">
              <Link href="/shop/rings" className="hover:text-rose-900 transition">Ring</Link>
              <Link href="/shop/earrings" className="hover:text-rose-900 transition">Earring</Link>
              <Link href="/shop/necklaces" className="hover:text-rose-900 transition">Necklace</Link>
              <Link href="/shop/bracelets" className="hover:text-rose-900 transition">Bracelet</Link>
            </div>
            
            {/* Right Menu Icons */}
            <div className="flex items-center space-x-6 text-gray-600">
              <button className="hover:text-rose-800 transition"><Search className="w-5 h-5" /></button>
              
              <Link href={user ? "/account/wishlist" : "#"} onClick={!user ? () => setIsLoginOpen(true) : undefined} className="hover:text-rose-800 transition">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Profile Section */}
              <div className="relative group py-4">
                {user ? (
                  <Link href="/account" className="flex items-center space-x-1 hover:text-rose-800 transition">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Hi, {userName || "User"}</span>
                  </Link>
                ) : (
                  <button onClick={() => setIsLoginOpen(true)} className="hover:text-rose-800 transition">
                    <User className="w-5 h-5" />
                  </button>
                )}
                {user && <AccountDropdown />}
              </div>
              
              {/* 🔴 Updated Cart Icon */}
              <Link href="/cart" className="hover:text-rose-800 transition relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}