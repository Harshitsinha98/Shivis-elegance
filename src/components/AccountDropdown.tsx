'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, History, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AccountDropdown() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            setUserName(docSnap.data().firstName || 'User');
          } else {
            setUserName('User');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName('User');
        }
      } else {
        setUserName(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); 
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (loading || !userName) return null;

  return (
    <div className="absolute right-0 top-full w-64 bg-white shadow-xl border border-gray-100 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
      
      {/* Header section with Flex layout for side-by-side alignment */}
      <div className="bg-rose-900 p-6 rounded-t-lg text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold border border-white/20 shrink-0">
            {userName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-medium leading-tight">{userName}</h2>
            <button className="text-[10px] bg-white/10 px-2 py-0.5 mt-1 rounded-full hover:bg-white/20 transition uppercase tracking-wider">
              View Rewards
            </button>
          </div>
        </div>
      </div>

      {/* Menu Links */}
      <div className="py-2">
        <Link href="/account/orders" className="px-6 py-3 flex items-center hover:bg-gray-50 text-gray-700 transition">
          <History className="w-4 h-4 mr-3" /> Order History
        </Link>
        <Link href="/account/orders" className="px-6 py-3 flex items-center hover:bg-gray-50 text-gray-700 transition">
          <MapPin className="w-4 h-4 mr-3" /> Track Order
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full px-6 py-3 flex items-center hover:bg-gray-50 text-rose-800 font-medium transition text-left"
        >
          <LogOut className="w-4 h-4 mr-3" /> Log Out
        </button>
      </div>
    </div>
  );
}