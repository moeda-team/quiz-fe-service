"use client";
// app/dashboard/student/classrooms/[_id]/page.tsx
import ClassroomDetail from "./ClassroomDetail";
import { notFound } from "next/navigation";
import { initialClassrooms } from "../mockClassrooms";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/student/DashboardLayout";

export default function ClassroomDetailPage() {
  const params = useParams();

  const id = params._id;

  // Cari classroom berdasarkan id dari URL
  const classroom = initialClassrooms.find((cls) => cls.id === id);

  if (!classroom) {
    // Kalau nggak ketemu, lempar ke 404 bawaan Next
    notFound();
  }

  return (
    <DashboardLayout>
      <ClassroomDetail
        classroom={classroom}
      />
    </DashboardLayout>
  );
}
