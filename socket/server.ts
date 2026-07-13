// ไฟล์: server.ts
import { Server, Socket } from "socket.io";

// 🎯 กำหนดรูปร่างหน้าตาของข้อมูล (Type) ป้องกันการส่งข้อมูลผิดพลาด
interface SubmissionUpdatePayload {
  userId: string;
  submissionId: string;
  status: string;
  score: number;
  runtime: number | null;
  memory: number | null;
}

const io = new Server(3001, {
  cors: { 
    origin: "*", // ยอมรับหน้าเว็บจาก localhost:3000
  } 
});

io.on("connection", (socket: Socket) => {
  console.log("New client connected:", socket.id);

  // 1. หน้าเว็บแจ้งเข้าห้องส่วนตัว
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // 2. Worker ส่งผลตรวจมา -> ส่งต่อไปให้หน้าเว็บของ User คนนั้น
  socket.on("worker:submission:update", (data: SubmissionUpdatePayload) => {
    console.log(`Verdict received for user ${data.userId} -> status: ${data.status}`);
    
    // ส่งข้อมูลต่อไปให้เฉพาะห้องของ userId นั้น
    io.to(data.userId).emit("submission:update", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log("🚀 Socket.io Server running on port 3001");