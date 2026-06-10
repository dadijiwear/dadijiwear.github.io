"use client";

import { useStore } from "@/store";

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();

  const handleStatusChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateOrderStatus(id, e.target.value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-gray-800 font-bold mb-6">Order Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={order.items.map((i: any) => i.name).join(", ")}>
                      {order.items.length} item(s) - {order.items[0]?.name} {order.items.length > 1 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold text-dadi-green">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full shadow-sm font-medium
                        ${order.status === 'Processing' ? 'bg-orange-100 text-orange-800 border border-orange-200' : ''}
                        ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e)}
                        className="bg-white border border-gray-300 text-sm rounded-md focus:ring-dadi-green focus:border-dadi-green block p-1.5"
                      >
                        <option value="Processing">Processing</option>
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
