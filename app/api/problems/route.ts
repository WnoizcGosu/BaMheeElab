import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    let dbProblems: any[] = [];

    try {
      // 1. ดึงข้อมูลโจทย์ทั้งหมดมาจาก PostgreSQL ผ่านท่อหลักที่เตรียมไว้
      dbProblems = await prisma.problem.findMany({
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (dbError) {
      console.error("[DATABASE_QUERY_ERROR] ติดปัญหาในการคิวรี่ตาราง Problem:", dbError);
      // ส่งอาเรย์ว่างเปล่าออกไปก่อนเพื่อให้หน้าเว็บยังโหลดขึ้น UI สำเร็จ ไม่พังหน้ามืด 500
      dbProblems = [];
    }

    // 2. ดักจับ Session ของคนที่กำลังเปิดหน้าเว็บแบบปลอดภัย
    let session: any = null;
    try {
      session = await getServerSession(authOptions as any) as any;
    } catch (sessionError) {
      console.warn("[SESSION_FETCH_WARNING] ดึงเซสชันไม่ได้ แต่ระบบจะรันหน้าเว็บต่อให้:", sessionError);
    }

    let userSubmissions: any[] = [];

    // เช็กประวัติส่งโค้ดเฉพาะเมื่อได้เซสชันมาสมบูรณ์
    if (session?.user?.id) {
      try {
        userSubmissions = await prisma.submission.findMany({
          where: { user_id: session.user.id },
          select: { problem_id: true, status: true },
        });
      } catch (subFetchError) {
        // ถ้าตาราง submission ยังไม่ถูกสร้างหรือมีปัญหา ให้คืนค่าอาเรย์ว่างเปล่าไปก่อน
        userSubmissions = [];
      }
    }

    // 3. นำข้อมูลโจทย์มาผสมเพื่อส่งออกไปแสดงผลหน้าบ้าน
    const formattedProblems = dbProblems.map((prob) => {
      const standardProbId = prob.id;
      const matchingSubs = userSubmissions.filter((s) => s.problem_id === standardProbId);

      let computedStatus = "unsolved";
      if (matchingSubs.some((s) => s.status === "ACCEPTED")) {
        computedStatus = "solved";
      } else if (matchingSubs.length > 0) {
        computedStatus = "attempted";
      }

      return {
        id: prob.id,
        title: prob.title,
        difficulty: prob.difficulty,
        status: computedStatus,
        tags: [prob.category],
      };
    });

    return NextResponse.json(formattedProblems, { status: 200 });

  } catch (error) {
    console.error("[PROBLEMS_FETCH_ERROR] ระบบตรวจพบปัญหาขัดข้องรุนแรงหลังบ้าน:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
