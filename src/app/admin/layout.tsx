import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Settings, ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-[header-footer-height])] bg-gray-50 flex-col md:flex-row shadow-inner">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif text-dadi-green font-bold tracking-tight">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your store</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            <LayoutDashboard size={20} className="text-dadi-green" />
            Dashboard
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            <Package size={20} className="text-dadi-gold" />
            Inventory
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            <ShoppingCart size={20} className="text-dadi-red" />
            Orders
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            <Package size={20} className="text-blue-500" />
            Categories
          </Link>
          <Link href="/admin/offers" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            <Settings size={20} className="text-purple-500" />
            Hero Carousel
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-dadi-green rounded-lg transition text-sm">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
