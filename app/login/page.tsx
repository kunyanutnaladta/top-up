"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Mail, Lock, ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ดึงค่าโหมดจาก URL ปัจจุบัน (?mode=register) ถ้าไม่มีให้ดริฟต์เป็น login อัตโนมัติ
  const mode = searchParams.get("mode") || "login";
  const isSignUp = mode === "register";

  // ล้างข้อความแจ้งเตือนทุกครั้งที่ลูกค้ากดสลับโหมดเข้าออก
  useEffect(() => {
    setMessage({ text: "", type: "" });
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (isSignUp) {
      // 🚀 ระบบสมัครสมาชิก (Register)
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "SIGN UP SUCCESS! NODE UNLOCKED. YOU CAN NOW SIGN IN.", type: "success" });
        // สมัครเสร็จแล้วตบ URL กลับมาหน้า login ปกติ
        router.push("/login");
      }
    } else {
      // 🔑 ระบบเข้าสู่ระบบ (Sign In)
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        // เจาะคุกกี้ผ่านปุ๊บ วิ่งทะลุเซสชันกลับหน้าแรกทันที
        window.location.href = "/";
      }
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#020406] text-slate-200 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* แสงเนบิวลาฟุ้งกระจายพื้นหลัง */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* ⬅️ ปุ่มย้อนกลับสู่มาตุภูมิ (Back to Home) วางตำแหน่งเหนือกล่องแบบหล่อๆ */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md mb-4 flex justify-start"
      >
        <Link href="/">
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-cyan-400 uppercase tracking-[0.2em] transition-colors bg-white/5 border border-white/5 hover:border-cyan-500/30 px-4 py-2 rounded-xl backdrop-blur-md">
            <ArrowLeft size={12} className="text-cyan-400" /> Back_To_Dashboard
          </button>
        </Link>
      </motion.div>

      {/* กล่อง Terminal หลัก */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-[#070a0e]/95 border border-cyan-500/30 rounded-[32px] p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-md relative z-10"
      >
        {/* หัวโลโก้และคำอธิบายเปลี่ยนตาม URL จริง */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_#06b6d4]">
            <Zap size={26} fill="currentColor" />
          </div>
          <h1 className="font-black text-2xl tracking-tighter text-white">TOPUP<span className="text-cyan-400">CENTER</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            {isSignUp ? "Register secure database node" : "Access your digital vault"}
          </p>
        </div>

        {/* ป้ายเตือนภัยกริฟสีแดง/เขียว */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border ${message.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
            <ShieldAlert size={16} />
            <span>{message.text.toUpperCase()}</span>
          </div>
        )}

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="NAME@DOMAIN.COM" className="w-full bg-[#05070a] border border-white/10 focus:border-cyan-500/50 rounded-xl text-white pl-12 pr-4 py-3.5 outline-none transition-all font-mono text-xs tracking-wider" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#05070a] border border-white/10 focus:border-cyan-500/50 rounded-xl text-white pl-12 pr-4 py-3.5 outline-none transition-all font-mono text-xs tracking-wider" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all mt-6">
            {isLoading ? "PROCESSING..." : isSignUp ? "Create Account" : "Authorize Session"}
          </button>
        </form>

        {/* ปุ่ม Google OAuth (จะเรนเดอร์เฉพาะโหมด Sign In) */}
        {!isSignUp && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute w-full border-t border-white/5"></div>
              <span className="relative bg-[#070a0e] px-4 text-[9px] text-slate-500 font-black uppercase tracking-widest">OR CONNECT WITH</span>
            </div>

            <button onClick={handleGoogleLogin} type="button" className="w-full py-3 bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign In with Google
            </button>
          </>
        )}

        {/* 🔄 ปุ่มสลับโหมดจัดเต็ม: กดปุ๊บ URL เปลี่ยนปั๊บ ทรงคุณค่าตามโครงสร้างมาตรฐาน */}
        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <button 
            onClick={() => {
              if (isSignUp) {
                router.push("/login"); // สลับมาโหมดเข้าสู่ระบบปกติ
              } else {
                router.push("/login?mode=register"); // สลับไปโหมดสมัครสมาชิกและเปลี่ยน URL หรูๆ
              }
            }} 
            className="text-[10px] font-black text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors"
          >
            {isSignUp ? "Already have a vault? → Sign In" : "New user? → Register Terminal"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#020406] text-slate-200 font-sans flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
