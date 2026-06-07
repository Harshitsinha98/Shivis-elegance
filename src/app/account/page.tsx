'use client'; // 1. Sabse upar ye hona zaroori hai
import { useEffect, useState } from 'react'; // 2. Yahan imports confirm karein
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AccountOverview() {
  const [userName, setUserName] = useState('Guest'); // Ab hook sahi jagah hai
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            setUserName(docSnap.data().firstName || 'Guest');
          }
        } catch (error) {
          console.error("Error fetching name:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white border border-gray-100 shadow-sm p-8">
      <h3 className="text-xl font-serif text-gray-900 mb-6">Account Overview</h3>
      
      {/* 🔴 Yahan dynamic welcome message */}
      <div className="bg-rose-50/50 p-6 rounded-lg border border-rose-100 mb-8">
        <h4 className="text-lg font-medium text-rose-900 mb-2">
          Welcome back, {userName}!
        </h4>
        <p className="text-gray-600">
          From your account dashboard, you can view your recent orders, manage your shipping and billing addresses, and edit your profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-100 p-6 rounded-lg">
          <h5 className="font-medium text-gray-900 border-b border-gray-100 pb-3 mb-4">Contact Info</h5>
          <p className="text-gray-600 mb-4">{auth.currentUser?.phoneNumber || 'No phone linked'}</p>
          <a href="/account/profile" className="text-rose-800 font-medium text-sm hover:underline">EDIT PROFILE</a>
        </div>

        <div className="border border-gray-100 p-6 rounded-lg">
          <h5 className="font-medium text-gray-900 border-b border-gray-100 pb-3 mb-4">Default Address</h5>
          <p className="text-gray-500 italic mb-4">You have not set a default shipping address.</p>
          <button className="text-rose-800 font-medium text-sm hover:underline">MANAGE ADDRESSES</button>
        </div>
      </div>
    </div>
  );
}