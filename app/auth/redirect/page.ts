// app/auth/redirect/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role;

  if (role === "admin") redirect("/dashboard/admin");
  if (role === "teacher") redirect("/dashboard/teacher");
  if (role === "student") redirect("/dashboard/student");

  redirect("/");
}
