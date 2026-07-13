import { NextResponse, type NextRequest } from "next/server";
import { judgeQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma"; 
import type {
  SubmitRequest,
  SubmitResponse,
  JudgeJobPayload,
} from "@/types/submission";
import { getServerSession } from "next-auth/next";
import { authOptions } from  "@/lib/auth";
import { Language as PrismaLanguage } from "@prisma/client";

const LANGS: ReadonlySet<string> = new Set(["PYTHON", "C", "CPP"]);

// ─── [GET] ดึงประวัติการส่งโค้ดของข้อนั้นๆ ───
export async function GET(req: NextRequest) {
  // เช็กสิทธิ์ผู้ใช้งานก่อนทำเรื่องดึงข้อมูล
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const problemId = req.nextUrl.searchParams.get("problemId");
  if (!problemId) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  // ดึงข้อมูลจริงจาก PostgreSQL ตาม userId คนที่ล็อกอินอยู่
  const submissions = await prisma.submission.findMany({
    where: {
      problem_id: problemId,
      user_id: userId,
    },
    orderBy: {
      submitted_at: "desc",
    },
    include: {
      test_case_results: true 
    }
  });

  return NextResponse.json(submissions);
}

// ─── [POST] รับโค้ดจากหน้าบ้านเพื่อตรวจ ───
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: SubmitRequest;
  try {
    body = (await req.json()) as SubmitRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validation ตัวแปรที่ส่งมา
  if (
    !body?.problemId ||
    !body?.sourceCode ||
    !LANGS.has(body.language)
  ) {
    return NextResponse.json(
      { error: "problemId, language (PYTHON|C|CPP), sourceCode required" },
      { status: 400 }
    );
  }
  console.log(body.language)

  // บันทึกลง PostgreSQL ผ่าน Prisma
  const submission = await prisma.submission.create({
    data: {
      user_id: userId,
      problem_id: body.problemId,
      language: body.language as PrismaLanguage,
      source_code: body.sourceCode,
    },
  });

  // จัดเตรียมข้อมูล Payload ส่งเข้าคิว BullMQ
  const payload: JudgeJobPayload = {
    submissionId: submission.id, 
    problemId: body.problemId,
    language: body.language,
    sourceCode: body.sourceCode,
    userId: userId,
  };

  await judgeQueue.add("judge", payload, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  // ส่ง HTTP Status 202 กลับไปที่หน้าบ้าน
  const res: SubmitResponse = { 
    submissionId: submission.id, 
    status: "PENDING" 
  };
  
  return NextResponse.json(res, { status: 202 });
}