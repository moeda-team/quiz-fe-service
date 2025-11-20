// app/dashboard/classrooms/page.tsx
"use client";

import { useState } from "react";
import ClassroomList from "./ClassroomList";
import type { Classroom } from "@/types/classroom";
import { initialClassrooms } from "./mockClassrooms";

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);

  const handleCreateClassroom = (
    payload: Omit<Classroom, "id" | "createdAt">
  ) => {
    const newClassroom: Classroom = {
      ...payload,
      id: crypto.randomUUID(),          // atau dari backend nanti
      createdAt: new Date().toISOString(),
    };
    setClassrooms((prev) => [...prev, newClassroom]);
  };

  const handleUpdateClassroom = (updated: Classroom) => {
    setClassrooms((prev) =>
      prev.map((cls) => (cls.id === updated.id ? updated : cls))
    );
  };

  const handleDeleteClassroom = (classroomId: string) => {
    setClassrooms((prev) => prev.filter((cls) => cls.id !== classroomId));
  };

  const handleSelectClassroom = (classroom: Classroom) => {
    console.log("Selected classroom:", classroom);
  };

  return (
    <ClassroomList
      classrooms={classrooms}
      onSelectClassroom={handleSelectClassroom}
      onCreateClassroom={handleCreateClassroom}
      onUpdateClassroom={handleUpdateClassroom}
      onDeleteClassroom={handleDeleteClassroom}
    />
  );
}
