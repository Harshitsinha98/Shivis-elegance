'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-white border border-gray-100 shadow-sm p-8">
      <h3 className="text-xl font-serif text-gray-900 mb-6">Order History</h3>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-100 p-6 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">Order #{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-500">Date: {order.date}</p>
                <p className="text-rose-800 font-medium">{order.status}</p>
              </div>
              <button className="bg-rose-900 text-white px-4 py-2 rounded text-sm hover:bg-rose-800">
                Track Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}