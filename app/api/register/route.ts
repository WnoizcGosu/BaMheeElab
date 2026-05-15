// app/api/register/route.ts
import { NextResponse } from "next/server";
import { findUserByUsername, findUserByEmail, createUser } from "@/lib/db/mock-users";

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

    await createUser({ username, email, password });

    console.log(`[API SUCCESS] Registration complete for user: ${username}`);
    return NextResponse.json({ message: "Account created successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[API CRASH] Registration endpoint failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}