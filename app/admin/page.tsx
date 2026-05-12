import { redirect } from "next/navigation";

export default function AdminDashboard() {
  // Redirect to problems for now, as it's the main feature
  redirect("/admin/problems");
}
