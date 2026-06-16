'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { TrendingUp, Package, Clock, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0 });

  // 🔴 1. Fetch All Orders from Database
  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData: any[] = [];
      let revenue = 0;
      let pending = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({ id: doc.id, ...data });
        revenue += data.totalAmount || 0;
        if (data.status === 'Paid' || data.status === 'Processing') pending += 1;
      });

      setOrders(ordersData);
      setStats({ totalRevenue: revenue, totalOrders: ordersData.length, pendingOrders: pending });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔴 2. Update Order Status Logic (For Tracking)
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      alert(`Order Status updated to ${newStatus}`);
      fetchOrders(); // Refresh table
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-900"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Overview Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time metrics and order management.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-700"><IndianRupee className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-700"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-full text-orange-700"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Processing</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID / Date</th>
                <th className="px-6 py-4 font-medium">Customer Details</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total Amount</th>
                <th className="px-6 py-4 font-medium">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-gray-900 font-medium text-xs">{order.id.slice(0, 10)}...</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Just now'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.shippingDetails?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.shippingDetails?.phone || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">{order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-rose-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase mt-1 inline-block">Paid</span>
                    </td>
                    <td className="px-6 py-4">
                      {/* 🔴 Dropdown for changing Order Status */}
                      <select 
                        value={order.status || 'Paid'} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full outline-none border cursor-pointer
                          ${order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : 
                            order.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                            'bg-orange-50 border-orange-200 text-orange-700'}`}
                      >
                        <option value="Paid">Paid / Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}