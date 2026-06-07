// app/api/register/route.ts
import { NextResponse } from "next/server";
import { findUserByUsername, findUserByEmail, createUser } from "@/lib/db/mock-users";
// 📥 1. อิมพอร์ต prisma client เพื่อเขียนลง PostgreSQL คู่กัน
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🔍 DEBUG LINE
    console.log("==========================================");
    console.log("[API INCOMING] POST Request received at /api/register");
    console.log(`[API PAYLOAD] Username: ${body.username} | Email: ${body.email}`);
    console.log("==========================================");

    const { username, email, password } = body;

    if (!username || !email || !password) {
      console.log("[API VALIDATION FAIL] Missing required registration fields.");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      console.log(`[API REJECTED] Username "${username}" already exists in local JSON file.`);
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      console.log(`[API REJECTED] Email "${email}" already registered.`);
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // 📝 2. บันทึกลงในไฟล์ JSON (จากระบบเดิม)
    // แนะนำ: ให้ตรวจสอบในฟังก์ชัน `createUser` ของคุณว่ามันทำการ return ออบเจกต์ผู้ใช้ที่มีค่า id ออกมาด้วยไหม 
    // ตัวอย่าง: const savedUser = await createUser({ username, email, password });
    const savedUser = await createUser({ username, email, password });

    // 📝 3. สั่งซิงค์เขียนลงตาราง User ของ PostgreSQL ทันที
    // โดยแมปรหัส ID ให้ตรงกับที่ฟังก์ชันสมัครฝั่ง JSON สุ่มสร้างขึ้นมา
    await prisma.user.create({
      data: {
        id: savedUser.id, // 👈 ล็อกรหัส ID เดียวกันเพื่อเป็นสะพานเชื่อม Foreign Key
        email: email,
        name: username,
        role: "USER"       // ตั้งสิทธิ์เริ่มต้นเป็นนักเรียนตาม Enum ของ Prisma
      }
    });

    console.log(`[API SUCCESS] Registration complete for user: ${username} (Synced to PostgreSQL)`);
    return NextResponse.json({ message: "Account created successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[API CRASH] Registration endpoint failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}