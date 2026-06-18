'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { IndianRupee, Package, Clock, X, MapPin, Phone, Mail } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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
      console.error(error); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, orderId: string) => {
    e.stopPropagation(); 
    const newStatus = e.target.value;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (error) { 
      alert('Failed to update status'); 
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-900"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Overview Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time metrics and order management.</p>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-full text-green-600"><IndianRupee className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-full text-blue-600"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-full text-orange-600"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Processing</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders List Widget */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
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
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent orders.</td></tr>
              ) : (
                orders.slice(0, 8).map((order) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-gray-900 font-medium text-xs">{order.id.slice(0, 10)}...</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Just now'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.shippingDetails?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.shippingDetails?.phone}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-rose-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                      <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase mt-1 inline-block font-bold">Paid</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        onClick={(e) => e.stopPropagation()} 
                        value={order.status || 'Paid'} 
                        onChange={(e) => handleStatusChange(e, order.id)}
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

      {/* Clickable Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif text-gray-900">Order Dispatch Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2 font-medium text-gray-900"><Phone className="w-4 h-4 text-gray-400"/> {selectedOrder.shippingDetails?.name}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> +91 {selectedOrder.shippingDetails?.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> {selectedOrder.shippingDetails?.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Shipping Address</h3>
                  <div className="space-y-1 text-sm text-gray-700 flex gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"/>
                    <p>{selectedOrder.shippingDetails?.address}, {selectedOrder.shippingDetails?.landmark && `${selectedOrder.shippingDetails.landmark},`} <br/>
                    {selectedOrder.shippingDetails?.city}, {selectedOrder.shippingDetails?.district}, {selectedOrder.shippingDetails?.state} - {selectedOrder.shippingDetails?.pincode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Items to Dispatch</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-xs font-mono bg-white border px-1.5 py-0.5 rounded text-rose-900 mt-1 inline-block">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}