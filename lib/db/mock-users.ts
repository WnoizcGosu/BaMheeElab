// lib/db.ts
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const filePath = path.join(process.cwd(), "data", "users.json");

// Helper to read users from the local file
export function getUsersCollection() {
  if (!fs.existsSync(filePath)) return [];
  const jsonData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(jsonData || "[]");
}

// ── FUTURE PROOF FUNCTIONS ──
// When you get a real DB, you will only rewrite the internals of these two functions!

interface User {
  username: string;
  email: string;
  password: string;
  id?: string;
  createdAt?: string;
}

export async function findUserByUsername(username: string) {
  const users = getUsersCollection();
  return users.find((u: User) => u.username === username.toLowerCase()) || null;
}

export async function findUserByEmail(email: string) {
  const users = getUsersCollection();
  return users.find((u: User) => u.email === email.toLowerCase()) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>) {
  const users = getUsersCollection();

  // Securely hash the password before saving to the file
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = {
    id: crypto.randomUUID(),
    username: userData.username.toLowerCase(),
    email: userData.email.toLowerCase(),
    password: hashedPassword, // Saved securely
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");

  console.log(`[DB SUCCESS] File updated successfully! Total local accounts registered: ${users.length}`);
  
  return newUser;
}