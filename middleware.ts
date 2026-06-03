import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";


export async function middleware(req: NextRequest) {
  // 1. ดึงตั๋วถอดรหัส Token ของคนที่พยายามจะคุยกับเส้นทางนี้
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 2. ถ้า URL ขึ้นต้นด้วยคำว่า /admin เช่น /admin/add-problem
  if (pathname.startsWith("/admin")) {
    // ถ้ายังไม่ได้ล็อกอิน หรือ มีล็อกอินแล้วแต่ Role ไม่ใช่แอดมิน
    // ใช้ (token as any) เพื่อบอก TypeScript ไม่ให้แจ้งเตือนเรื่อง property 'role'
    if (!token || token.role !== "admin") {
      // ดีดส่งกลับไปที่หน้าแสดงโจทย์ทันที ป้องกันระบบพัง
      return NextResponse.redirect(new URL("/problems", req.url));
    }
  }

  return NextResponse.next();
}

// ระบุขอบเขตให้ระบบ Middleware เฝ้าระวังเฉพาะหน้า admin
export const config = {
  matcher: ["/admin/:path*"],
};