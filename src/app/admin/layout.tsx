'use client';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Package, Store } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Active link check karne ka chota sa logic
  const isActive = (path: string) => pathname === path ? "bg-rose-50 text-rose-900 border-r-4 border-rose-900" : "text-gray-600 hover:bg-rose-50 hover:text-rose-900";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-serif text-rose-900 font-semibold">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-1 text-sm font-medium">
          <Link href="/admin" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/admin')}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/add-product" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/admin/add-product')}`}>
            <PlusCircle className="w-5 h-5" /> Add Product
          </Link>
          <Link href="/admin/orders" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/admin/orders')}`}>
            <Package className="w-5 h-5" /> Manage Orders
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="/" className="flex items-center gap-3 p-3 text-gray-500 hover:text-gray-900 transition-all">
              <Store className="w-5 h-5" /> Back to Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}