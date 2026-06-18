"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type OrderRow = {
  id: string;
  order_ref: string;
  game_title: string;
  package_name: string;
  player_id: string;
  payment_channel: string;
  price: number;
  status: "pending" | "paid" | "success" | "failed";
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id,order_ref,game_title,package_name,player_id,payment_channel,price,status,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderRow[]);
      }
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#020406] text-slate-200 p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            My <span className="text-cyan-400">Orders</span>
          </h1>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-cyan-400 border border-cyan-500/40 px-4 py-2 rounded-lg"
          >
            Back Home
          </Link>
        </div>

        {isLoading ? (
          <div className="border border-cyan-500/20 rounded-2xl p-8 text-center text-cyan-300">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-dashed border-cyan-500/20 rounded-2xl p-8 text-center text-slate-400">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-400 uppercase text-[11px] tracking-widest">
                <tr>
                  <th className="text-left px-4 py-3">Ref</th>
                  <th className="text-left px-4 py-3">Game</th>
                  <th className="text-left px-4 py-3">Package</th>
                  <th className="text-left px-4 py-3">Player ID</th>
                  <th className="text-left px-4 py-3">Pay</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-mono">{order.order_ref}</td>
                    <td className="px-4 py-3">{order.game_title}</td>
                    <td className="px-4 py-3">{order.package_name}</td>
                    <td className="px-4 py-3 font-mono">{order.player_id}</td>
                    <td className="px-4 py-3 uppercase">{order.payment_channel}</td>
                    <td className="px-4 py-3 uppercase">{order.status}</td>
                    <td className="px-4 py-3 text-right">฿{order.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
