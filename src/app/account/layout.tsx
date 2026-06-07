'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Gift, CreditCard, MapPin, Heart, History, LogOut, FileText } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 🔴 Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Logout hote hi Home page par bhej do
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const menuItems = [
    { name: 'Overview', path: '/account', icon: User },
    { name: 'Personal Information', path: '/account/profile', icon: FileText },
    { name: 'Saved Payments Method', path: '/account/payments', icon: CreditCard },
    { name: 'Address Book', path: '/account/address', icon: MapPin },
    { name: 'Wishlist', path: '/account/wishlist', icon: Heart },
    { name: 'Order History', path: '/account/orders', icon: History },
    { name: 'Gift Card Balance', path: '/account/gift-cards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">My Account</h2>
          <div className="bg-white border border-gray-100 shadow-sm flex flex-col">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`px-6 py-4 border-b border-gray-50 flex items-center transition-colors duration-200 ${
                    isActive 
                      ? 'bg-rose-900 text-white border-l-4 border-l-rose-700' 
                      : 'text-gray-700 hover:bg-rose-50 hover:text-rose-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* 🔴 Updated Log Out Button */}
            <button 
              onClick={handleLogout}
              className="px-6 py-4 flex items-center text-gray-700 hover:bg-rose-50 hover:text-rose-900 transition-colors duration-200 text-left w-full"
            >
              <LogOut className="w-5 h-5 mr-4" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area (Dynamic) */}
        <div className="w-full md:w-3/4">
          {children}
        </div>
        
      </div>
    </div>
  );
}