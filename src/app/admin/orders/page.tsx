'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Search, X, MapPin, Phone, Mail, Package } from 'lucide-react';

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = orders;
    if (activeTab !== 'All') {
      result = result.filter(o => o.status === activeTab || (activeTab === 'Paid' && o.status === 'Processing'));
    }
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(queryLower) || 
        o.shippingDetails?.name?.toLowerCase().includes(queryLower)
      );
    }
    setFilteredOrders(result);
  }, [searchQuery, activeTab, orders]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, orderId: string) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: e.target.value });
      fetchOrders();
    } catch (error) { alert('Failed to update status'); }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-900"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-2"><Package className="w-8 h-8 text-rose-900"/> Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track, filter, and update dispatch status.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Search by Order ID or Name..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 p-2 border border-gray-200 rounded-lg outline-none focus:border-rose-900 text-sm bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-px">
        {['All', 'Paid', 'Shipped', 'Delivered'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-rose-900 text-rose-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab} {tab !== 'All' && `(${orders.filter(o => o.status === tab || (tab === 'Paid' && !o.status)).length})`}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found matching your criteria.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-gray-900 font-medium text-xs">{order.id}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString('en-IN') : 'Just now'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.shippingDetails?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.shippingDetails?.phone}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 font-semibold text-rose-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <select onClick={(e) => e.stopPropagation()} value={order.status || 'Paid'} onChange={(e) => handleStatusChange(e, order.id)} className={`text-xs font-medium px-3 py-1.5 rounded-full outline-none border cursor-pointer ${order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : order.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
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

      {/* ORDER DETAILS MODAL (Same as Dashboard) */}
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
                        {/* 🔴 SKU DISPLAY FOR ADMIN */}
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