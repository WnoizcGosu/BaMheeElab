import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthProvider from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
  title: "BaMhee E-lab | Online Programming Judge",
  description: "Practice coding problems, track your progress, and improve your programming skills with BaMhee E-lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        
        <AuthProvider>
          {children}
        </AuthProvider>
        
      </body>
    </html>
  );
}