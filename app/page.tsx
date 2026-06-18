"use client";
import { useState, useEffect } from "react";
import GameCard from "@/components/GameCard";
import { ChevronLeft, ChevronRight, Zap, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // คลังหน้าบ้าน

const BANNERS = [
  { id: 1, image: "/banners/Valorant-Kuronami-2.0-Bundle.webp" },
  { id: 2, image: "/banners/rov.jpg" }, 
  { id: 3, image: "/banners/deadby.png" } 
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [games, setGames] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // State เก็บข้อมูลคนล็อกอินจริง

  // ดึงข้อมูลเกม และ ดึงข้อมูลเซสชันคนใช้งานจริง
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      // 1. ดึงข้อมูลผู้ใช้งานปัจจุบัน
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }

      // 2. ดึงข้อมูลเกม
      const { data, error } = await supabase
        .from("games")
        .select(`*, packages (*)`);

      if (!error && data) {
        const formatted = data.map((game: any) => ({
          title: game.title,
          category: game.category,
          image: game.image_url, 
          currencyName: game.currency_name,
          packages: game.packages.sort((a: any, b: any) => a.price - b.price).map((pkg: any) => ({
            id: pkg.id,
            name: `${pkg.base_amount} ${game.currency_name}`,
            price: pkg.price,
            baseAmount: pkg.base_amount,
            bonusAmount: pkg.bonus_amount
          }))
        }));
        setGames(formatted);
      }
      setIsLoading(false);
    };

    initData();
  }, []);

  // ฟังก์ชันกดออกจากระบบแบบคลีนคุกกี้
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // เคลียร์แล้วดีดกลับหน้าเข้าสู่ระบบทันที
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  return (
    <main className="min-h-screen bg-[#020406] text-slate-200 font-sans overflow-x-hidden">
      
      {/* --- Navbar จัดเต็ม สลับปุ่มอัตโนมัติยิงตามคุกกี้จริง --- */}
      <nav className="w-full bg-black/90 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.9)] transition-all">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">
              TOPUP<span className="text-cyan-400">CENTER</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400 tracking-wider">
            <a href="#" className="hover:text-cyan-400 transition-colors">HOME</a>
            <Link href="/orders" className="hover:text-cyan-400 transition-colors">MY ORDERS</Link>
            <a href="#" className="hover:text-cyan-400 transition-colors">SUPPORT</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">PROMOTIONS</a>
          </div>

          {/* ⚡ บล็อกเช็คสเตตัส ล็อกอิน/ไม่ล็อกอิน เพื่อเรนเดอร์ UI */}
          {user ? (
            <div className="flex items-center gap-4 animate-fadeIn">
              <div className="hidden sm:flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/20 px-4 py-2 rounded-xl">
                <User size={14} className="text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-300 max-w-[150px] truncate">{user.email}</span>
              </div>
              <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-black text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <LogOut size={14} /> Exit
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="sm:flex items-center gap-2 text-sm font-bold text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black px-6 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                Login
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* --- ส่วนเนื้อหาแบนเนอร์และลูปการ์ดเกมข้างล่างเหมือนเดิมทุกประการ ไม่ต้องแก้เพิ่ม --- */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="relative w-full h-[250px] md:h-[450px] mb-20 group">
          <div className="absolute -inset-6 bg-cyan-500/15 blur-[80px] rounded-full opacity-60 pointer-events-none z-0"></div>
          <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-cyan-500/50 shadow-[0_0_60px_-10px_rgba(6,182,212,0.5),_0_0_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_80px_-5px_rgba(6,182,212,0.7),_0_0_30px_rgba(0,0,0,0.8)] transition-shadow duration-700 z-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute inset-0 w-full h-full" >
                <Image src={BANNERS[currentSlide].image} alt="Promotion" fill priority className="object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 pointer-events-none">
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_3px,3px_100%]"></div>
                   <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-300 drop-shadow-[0_0_8px_#22d3ee] opacity-80"></div>
                   <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-300 drop-shadow-[0_0_8px_#22d3ee] opacity-80"></div>
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020406] via-transparent to-black/20"></div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-cyan-500/20 opacity-0 group-hover:opacity-100 hover:shadow-[0_0_20px_#22d3ee] transition-all z-30">
              <ChevronLeft size={32} />
            </button>
            <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-cyan-500/20 opacity-0 group-hover:opacity-100 hover:shadow-[0_0_20px_#22d3ee] transition-all z-30">
              <ChevronRight size={32} />
            </button>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-3 z-30">
              {BANNERS.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`transition-all duration-500 rounded-sm ${currentSlide === index ? "h-12 w-1 bg-cyan-400 shadow-[0_0_20px_#22d3ee]" : "h-4 w-1 bg-white/20 hover:bg-white/50"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10 flex items-center justify-between border-l-4 border-cyan-500 pl-6">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Select <span className="text-cyan-400">Target</span></h2>
          <button className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-[0.2em] transition-colors border border-slate-800 px-4 py-2 rounded-full hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">LIVE_DATA_SYNC</button>
        </div>

        {isLoading ? (
          <div className="w-full h-40 flex flex-col items-center justify-center gap-2 border border-dashed border-cyan-500/20 rounded-[32px] bg-cyan-500/5">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Syncing Cryptographic Assets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {games.map((game, index) => (
              <GameCard key={index} title={game.title} category={game.category} image={game.image} currencyName={game.currencyName} gamePackages={game.packages} />
            ))}
          </div>
        )}
      </div>

      <footer className="mt-20 bg-black py-16 border-t border-cyan-900/20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm font-medium">
          <div className="flex items-center gap-3 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]">
            <Zap size={20} fill="currentColor"/>
            <span className="font-black text-lg tracking-tighter text-white">TOPUPCENTER</span>
          </div>
          <p>© 2026 DIGITAL_VAULT_NETWORK. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-cyan-400 transition-colors">TERMS</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">PRIVACY</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
