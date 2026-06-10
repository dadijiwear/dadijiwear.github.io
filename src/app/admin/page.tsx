"use client";

import { useStore } from "@/store";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { orders, products } = useStore();

  // Stats calculation
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-gray-800 font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-dadi-green/10 text-dadi-green rounded-full flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-dadi-gold/10 text-dadi-gold rounded-full flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-dadi-red/10 text-dadi-red rounded-full flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-800">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-dadi-blue/10 text-dadi-blue rounded-full flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Growth</p>
            <h3 className="text-2xl font-bold text-gray-800">+12.5%</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Mock */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-serif text-gray-800 mb-4 font-bold border-b pb-2">Recent Orders Activity</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 py-4">No recent orders yet.</p>
        ) : (
          <div className="space-y-4 pt-2">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-gray-800">{order.id} <span className="text-sm font-normal text-gray-500 ml-2">{new Date(order.date).toLocaleDateString()}</span></p>
                  <p className="text-sm text-gray-500">{order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dadi-green">₹{order.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded shadow-sm ${order.status === 'Processing' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
