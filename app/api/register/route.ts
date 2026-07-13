// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // 🔍 1. ตรวจสอบว่าส่งข้อมูลมาครบถ้วนไหม
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 🔍 2. ตรวจสอบว่า Username นี้ถูกใช้งานไปแล้วหรือยัง (เช็คจากฟิลด์ name)
    const existingUsername = await prisma.user.findFirst({
      where: { name: username }
    });
    if (existingUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // 🔍 3. ตรวจสอบว่า Email นี้ถูกใช้งานไปแล้วหรือยัง
    const existingEmail = await prisma.user.findUnique({
      where: { email: email }
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // 💡 หากต้องการเข้ารหัสผ่านก่อนบันทึก ให้ใช้โค้ดชุดนี้แทน:
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 4. บันทึกผู้ใช้ใหม่ลง PostgreSQL ด้วย Prisma ล้วนๆ
    await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        role: "USER"
      }
    });

    console.log(`[API SUCCESS] Registration complete for user: ${username} via Prisma`);
    return NextResponse.json({ message: "Account created successfully!" }, { status: 201 });

  } catch (error) {
    console.error("[API CRASH] Registration endpoint failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}