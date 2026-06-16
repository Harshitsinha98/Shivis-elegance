'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ShoppingBag, Package, Calendar, CreditCard, User, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Firestore se sirf is logged-in user ke orders nikalna
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOrders(ordersData);
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Please Login to View Dashboard</h2>
        <p className="text-gray-500 mb-6 max-w-sm">You need to be authenticated to view your purchased products and order history.</p>
        <Link href="/">
          <button className="bg-rose-900 text-white px-6 py-2.5 rounded hover:bg-rose-800 transition text-sm font-medium">
            Go to Homepage
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-white min-h-[80vh]">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Manage your orders and purchase profile.</p>
        </div>
        <button onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition border border-gray-200 px-4 py-2 rounded-lg bg-gray-50">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Small Sidebar: Profile Overview */}
        <div className="w-full lg:w-1/4 bg-gray-50 p-5 rounded-xl border border-gray-100 h-fit">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
            <div className="bg-rose-100 text-rose-900 p-2.5 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">Customer Account</h3>
              <p className="text-xs text-gray-500 truncate">{user.phone || user.email}</p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between py-1.5">
              <span>Total Orders Placed:</span>
              <span className="font-semibold text-gray-900">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Right Main Panel: Purchased Products & Order History */}
        <div className="w-full lg:w-3/4">
          <h2 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-900" /> Purchase History & Products
          </h2>

          {orders.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders found. Start shopping to fill your gallery!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-xl shadow-sm overflow-hidden bg-white">
                  
                  {/* Order Top Sub-bar (Responsive Grid) */}
                  <div className="bg-gray-50 px-4 py-4 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs md:text-sm text-gray-600">
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-gray-900 truncate mt-0.5">{order.id.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wider flex items-center"><Calendar className="w-3 h-3 mr-1" /> Date</p>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Just now'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wider flex items-center"><CreditCard className="w-3 h-3 mr-1" /> Total Paid</p>
                      <p className="font-semibold text-rose-900 mt-0.5">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px] uppercase tracking-wider">Status</p>
                      <span className="inline-block bg-green-100 text-green-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium mt-1">
                        {order.status || 'Paid'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Inside */}
                  <div className="p-4 divide-y divide-gray-100">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-md bg-gray-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Category: {item.category}</p>
                          <p className="text-xs text-gray-400 mt-1 md:hidden">Qty: {item.quantity} • ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="hidden md:block text-right text-sm">
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                          <p className="font-medium text-gray-900 mt-0.5">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}