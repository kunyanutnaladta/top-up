"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Wallet, QrCode, Clock, ShieldCheck, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface GameCardProps {
  title: string;
  category: string;
  image?: string;
  currencyName: string;
  gamePackages: Array<{
    id: string | number;
    name: string;
    price: number;
    baseAmount: number;
    bonusAmount: number;
  }>;
}

type OrderStatus = "pending" | "paid" | "success" | "failed";

export default function GameCard({
  title,
  category,
  image,
  currencyName,
  gamePackages,
}: GameCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 3>(1);
  const [playerId, setPlayerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | number | null>(null);
  const [orderRef, setOrderRef] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [timeLeft, setTimeLeft] = useState(300);

  const channels = [
    { id: "promptpay", name: "PROMPTPAY", icon: <QrCode size={18} /> },
    { id: "truemoney", name: "TRUEMONEY", icon: <Wallet size={18} /> },
  ];

  useEffect(() => {
    if (step !== 3 || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [step, timeLeft]);

  const verifyPlayerId = async (id: string) => {
    const trimmedId = id.trim();
    if (trimmedId.length < 4) {
      alert("Please enter a valid Player ID (min 4 chars).");
      setCharacterName("");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setCharacterName(`VERIFIED_NODE: ${trimmedId.toUpperCase()}`);
    setIsLoading(false);
  };

  const currentSelectedPkg = gamePackages.find((p) => p.id === selectedPackage);

  const createOrder = async () => {
    if (!characterName || !selectedChannel || !currentSelectedPkg) return;
    setIsLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const generatedRef = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_ref: generatedRef,
          user_id: session?.user?.id ?? null,
          player_id: playerId.trim(),
          game_title: title,
          package_name: `${currentSelectedPkg.baseAmount} ${currencyName}`,
          price: currentSelectedPkg.price,
          payment_channel: selectedChannel,
          status: "pending",
        },
      ])
      .select("id,status")
      .single();

    if (error) {
      alert(`Transaction failed: ${error.message}`);
      setIsLoading(false);
      return;
    }

    setOrderId(data?.id ?? null);
    setOrderStatus((data?.status as OrderStatus) ?? "pending");
    setOrderRef(generatedRef);
    setStep(3);
    setIsLoading(false);
  };

  const updateOrderStatus = async (nextStatus: Exclude<OrderStatus, "pending">) => {
    if (!orderId) return;
    setIsLoading(true);
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      setOrderStatus(nextStatus);
    }
    setIsLoading(false);
  };

  const reset = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setPlayerId("");
      setCharacterName("");
      setSelectedChannel(null);
      setSelectedPackage(null);
      setOrderRef("");
      setOrderId(null);
      setOrderStatus("pending");
      setTimeLeft(300);
    }, 250);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        onClick={async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) setIsModalOpen(true);
          else router.push("/login");
        }}
        className="bg-[#0e1217] rounded-[28px] overflow-hidden border border-white/5 hover:border-cyan-500/40 transition-all duration-500 cursor-pointer group shadow-xl"
      >
        <div className="h-[170px] w-full relative overflow-hidden bg-slate-900">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1217] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 bg-cyan-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            {category}
          </div>
        </div>
        <div className="p-5 flex flex-col items-center text-center">
          <h3 className="font-black text-[14px] text-white uppercase tracking-tight mb-3 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {title}
          </h3>
          <button className="w-full py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-cyan-500 group-hover:text-black transition-all">
            Add Credits
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-xl bg-[#070a0e]/95 rounded-[32px] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0d13] sticky top-0 z-10">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{title}</h2>
                <button onClick={reset} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow">
                {step === 1 && (
                  <>
                    <div className="bg-[#11161e] p-5 rounded-2xl border border-white/10">
                      <label className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-3 block">
                        01 // Identify Account
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playerId}
                          onChange={(e) => {
                            setPlayerId(e.target.value);
                            setCharacterName("");
                          }}
                          placeholder="ENTER PLAYER ID"
                          className="flex-grow bg-[#05070a] border border-white/10 rounded-xl text-white px-4 py-3 outline-none uppercase font-mono text-xs"
                        />
                        <button
                          onClick={() => verifyPlayerId(playerId)}
                          disabled={!playerId || isLoading}
                          className="px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black rounded-xl font-black uppercase text-[10px]"
                        >
                          {isLoading ? "..." : "Verify"}
                        </button>
                      </div>
                      {characterName && (
                        <div className="mt-3 flex items-center gap-2.5 text-cyan-400 bg-cyan-500/5 p-3.5 rounded-xl border border-cyan-500/20">
                          <ShieldCheck size={16} />
                          <span className="text-xs font-mono font-bold">{characterName}</span>
                        </div>
                      )}
                    </div>

                    <div className={`transition-all ${!characterName ? "pointer-events-none opacity-20" : ""}`}>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 block text-cyan-400">
                        02 // Payment Gateway
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {channels.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedChannel(c.id)}
                            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${selectedChannel === c.id ? "border-cyan-500 bg-cyan-500/25 text-cyan-400" : "border-white/10 bg-[#11161e] text-slate-200"}`}
                          >
                            {c.icon}
                            <span className="text-[9px] font-black tracking-widest">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`transition-all ${!selectedChannel ? "pointer-events-none opacity-20" : ""}`}>
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 block text-cyan-400">
                        03 // Select Credits
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {gamePackages.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPackage(p.id)}
                            className={`p-5 rounded-2xl border relative ${selectedPackage === p.id ? "border-cyan-500 bg-cyan-500/25" : "border-white/10 bg-[#11161e]"}`}
                          >
                            {selectedPackage === p.id && (
                              <div className="absolute top-2.5 right-2.5 text-cyan-400">
                                <Check size={14} />
                              </div>
                            )}
                            <p className="text-slate-200 font-black text-xs uppercase">
                              {p.baseAmount} {currencyName}
                            </p>
                            {p.bonusAmount > 0 && (
                              <span className="mt-1 px-2 py-0.5 rounded text-[8px] font-black text-cyan-400 bg-cyan-500/10 inline-block">
                                +{p.bonusAmount} BONUS
                              </span>
                            )}
                            <p className="text-white font-black text-2xl mt-2.5">฿{p.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="w-full bg-black rounded-[32px] p-8 border border-cyan-500/20 text-center">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                      <div className="text-left">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Order Ref.</p>
                        <div className="flex items-center gap-1.5 text-white font-mono text-xs">
                          {orderRef}
                          <Copy
                            size={12}
                            className="cursor-pointer hover:text-cyan-400"
                            onClick={() => navigator.clipboard.writeText(orderRef)}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Total</p>
                        <p className="text-cyan-400 font-black text-2xl">฿{currentSelectedPkg?.price}</p>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] inline-block mb-6">
                      <QrCode size={180} className="text-black" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold mb-1.5 text-xs">
                      <Clock size={14} className={timeLeft <= 60 ? "animate-pulse text-red-500" : "text-cyan-500"} />
                      <span className={timeLeft <= 60 ? "text-red-500" : ""}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em]">Scan with Banking App</p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => updateOrderStatus("paid")}
                        disabled={isLoading || orderStatus !== "pending"}
                        className="px-3 py-2 text-[10px] font-black uppercase rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 disabled:opacity-30"
                      >
                        Mock Paid
                      </button>
                      <button
                        onClick={() => updateOrderStatus("success")}
                        disabled={isLoading || orderStatus === "success"}
                        className="px-3 py-2 text-[10px] font-black uppercase rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 disabled:opacity-30"
                      >
                        Mock Success
                      </button>
                      <button
                        onClick={() => updateOrderStatus("failed")}
                        disabled={isLoading || orderStatus === "failed"}
                        className="px-3 py-2 text-[10px] font-black uppercase rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 disabled:opacity-30"
                      >
                        Mock Failed
                      </button>
                    </div>
                    <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-400">
                      Status: <span className="text-white">{orderStatus}</span>
                    </p>
                    <Link href="/orders" className="inline-block mt-4 text-[10px] uppercase tracking-widest text-cyan-300 hover:text-cyan-200">
                      View Order History
                    </Link>
                  </div>
                )}
              </div>

              {step === 1 && (
                <div className="p-6 border-t border-white/5 bg-[#0a0d13] flex justify-between items-center sticky bottom-0 z-10">
                  <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic opacity-40">
                    Secure Transaction Engine
                  </div>
                  <button
                    onClick={createOrder}
                    disabled={!characterName || !selectedChannel || !selectedPackage || isLoading}
                    className="px-10 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 text-black rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    {isLoading ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
