"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard" | "God",
    time_limit: 1000,
    memory_limit: 256,
  });

  const [testCases, setTestCases] = useState<{ id: string; inputContent: string; outputContent: string; isPublic: boolean }[]>([
    { id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }
  ]);

  const handleAddTestCaseField = () => {
    setTestCases([...testCases, { id: uuidv4(), inputContent: "", outputContent: "", isPublic: false }]);
  };

  const handleRemoveTestCaseField = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const handleUpdateTestCaseField = (id: string, field: "inputContent" | "outputContent" | "isPublic", value: string | boolean) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // กรองเฉพาะเคสที่มีข้อมูลไม่เป็นค่าว่าง
      const validTestCases = testCases.filter(
        tc => tc.inputContent.trim() !== "" && tc.outputContent.trim() !== ""
      );

      const res = await fetch("/api/admin/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🎯 ปรับปรุงก้อนข้อมูลจัดส่ง (Payload) ให้ตรงกันกับโครงสร้างของ Schema Prisma
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          
          // 📊 แมปฟิลด์ข้อจำกัดเวลาและความจำให้ตรงโมเดล Problem
          time_limit: formData.time_limit,
          timeLimit: formData.time_limit,     // ส่งเผื่อสำหรับ API ขาแปลง CamelCase
          memory_limit: formData.memory_limit,
          memoryLimit: formData.memory_limit, // ส่งเผื่อสำหรับ API ขาแปลง CamelCase

          // 📊 แปลงโครงสร้างอาเรย์ด้านในให้ตรงโมเดล TestCase ใน schema.prisma
          testCases: validTestCases.map((tc, index) => ({
            order_index: index,               // ลำดับอินเด็กซ์ตามโครงสร้างตาราง
            is_public: tc.isPublic,           // แปลงเป็นตัวพิมพ์เล็กแบบงูตาม DB
            input_content: tc.inputContent,   // แปลงเป็นตัวพิมพ์เล็กแบบงูตาม DB
            output_content: tc.outputContent, // แปลงเป็นตัวพิมพ์เล็กแบบงูตาม DB
            
            // ส่งสไตล์ CamelCase ควบคู่เพื่อความปลอดภัยชั้นเน็ตเวิร์ก
            isPublic: tc.isPublic,
            inputContent: tc.inputContent,
            outputContent: tc.outputContent,
          })),
        }),
      });

      if (res.ok) {
        router.push("/admin/problems");
        router.refresh();
      } else {
        console.error("Failed to save problem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--accent-orange)";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 101, 43, 0.1)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "var(--border-light)";
      e.currentTarget.style.boxShadow = "none";
    },
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 20px" }}>
        Create New Problem
      </h1>

      <div className="card" style={{ overflow: "hidden" }}>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={inputStyle}
                placeholder="e.g. A+B Problem"
                {...focusHandlers}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Describe the problem..."
                {...focusHandlers}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Programming">Programming</option>
                  <option value="Stat">Statistical Programming</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as "Easy" | "Medium" | "Hard" | "God",
                    })
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                  <option value="God">GOD</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Time Limit (ms)</label>
                <input
                  required
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
              <div>
                <label style={labelStyle}>Memory Limit (MB)</label>
                <input
                  required
                  type="number"
                  value={formData.memory_limit}
                  onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 24, paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              Test Cases
            </h3>
            
            <div className="flex flex-col gap-4">
              {testCases.map((tc, idx) => (
                <div key={tc.id} className="p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                  <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-sm">Test Case #{idx + 1}</span>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={tc.isPublic}
                            onChange={(e) => handleUpdateTestCaseField(tc.id, "isPublic", e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 font-medium">แสดงเป็นตัวอย่างในโจทย์ (Public)</span>
                        </label>
                      </div>
                      {testCases.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveTestCaseField(tc.id)} 
                          className="text-red-500 hover:text-red-700"
                          title="Remove Test Case"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Input Data</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        rows={4}
                        value={tc.inputContent}
                        onChange={(e) => handleUpdateTestCaseField(tc.id, "inputContent", e.target.value)}
                        placeholder="Enter input string..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Output</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        rows={4}
                        value={tc.outputContent}
                        onChange={(e) => handleUpdateTestCaseField(tc.id, "outputContent", e.target.value)}
                        placeholder="Enter expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={handleAddTestCaseField}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 self-start"
              >
                <Plus size={16} /> Add Another Test Case Field
              </button>
            </div>
          </div>

          <div
            className="flex justify-end gap-3"
            style={{ borderTop: "1px solid var(--border-light)", marginTop: 24, paddingTop: 24 }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
              style={{
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #E8652B, #D4541E)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  <span>Saving...</span>
                </>
              ) : (
                "Create Problem"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}