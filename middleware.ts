import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  // ตรวจสอบเซสชันผู้ใช้ปัจจุบัน
  const { data: { user } } = await supabase.auth.getUser();

  // 🔓 [ปรับปรุงใหม่] ปล่อยให้เข้าหน้าแรก (/) ได้อิสระ ไม่ดีดไปไหนแล้ว แม้ยังไม่ล็อกอิน
  // แต่ถ้าล็อกอินอยู่แล้ว แต่อุตริจะแอบพิมพ์สลัวเข้าหน้า /login อีก... ให้ดีดกลับไปหน้าแรกทันที
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // ให้ Middleware ทำงานกับทุกหน้า ยกเว้นไฟล์รูปภาพและระบบภายในของ Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

