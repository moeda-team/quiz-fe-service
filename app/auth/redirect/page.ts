// app/auth/redirect/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role?.toLowerCase();

  if (role === "admin" || role === "teacher") redirect("/host");
  if (role === "student") redirect("/dashboard/student");

  redirect("/");
}
