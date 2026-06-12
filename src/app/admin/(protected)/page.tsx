"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950 text-neutral-100 flex flex-col p-8 font-sans">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Control Panel</h1>
        <p><a href="/admin/orders">Order Management</a></p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Logout Session
        </button>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h2 className="text-lg font-medium text-neutral-300 mb-2">Total Products</h2>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h2 className="text-lg font-medium text-neutral-300 mb-2">Active Orders</h2>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h2 className="text-lg font-medium text-neutral-300 mb-2">System Status</h2>
          <p className="text-3xl font-bold text-green-500">Secure</p>
        </div>
      </div>
    </div>
  );
}
