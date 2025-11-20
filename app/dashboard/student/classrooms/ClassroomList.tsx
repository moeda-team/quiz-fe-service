// components/ClassroomList.tsx
"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreateClassroomModal from "@/components/modal/CreateClassroomModal";
import UpdateClassroomModal from "@/components/modal/UpdateClassroomModal";
import type { Classroom } from "@/types/classroom";
import { DashboardHeader } from "@/components/layout/student/DashboardHeader";
import { DashboardFooter } from "@/components/layout/student/DashboardFooter";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ClassroomListProps {
  classrooms: Classroom[];
  onSelectClassroom: (classroom: Classroom) => void;
  onCreateClassroom: (classroom: Omit<Classroom, "id" | "createdAt">) => void;
  onUpdateClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (classroomId: string) => void;
}

export default function ClassroomList({
  classrooms,
  onSelectClassroom,
  onCreateClassroom,
  onUpdateClassroom,
  onDeleteClassroom,
}: ClassroomListProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] =
    useState<Classroom | null>(null);

  const handleEditClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    classroom: Classroom,
  ) => {
    e.stopPropagation();
    setSelectedClassroom(classroom);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    classroomId: string,
    classroomName: string,
  ) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus kelas "${classroomName}"?`,
      )
    ) {
      onDeleteClassroom(classroomId);
    }
  };

  const getScheduleShort = (schedule: string) => {
    if (!schedule) return "-";
    const parts = schedule.split("•");
    return parts[0]?.trim() ?? schedule;
  };

  const hasClassrooms = classrooms && classrooms.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black mb-6">
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-2">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2">Daftar Kelas</h1>
            <p className="text-gray-600">Pilih kelas yang ingin Anda akses</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black hover:bg-black/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Kelas Baru
          </Button>
        </div>

        {!hasClassrooms ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-gray-500">
              Belum ada kelas. Klik &quot;Buat Kelas Baru&quot; untuk
              menambahkan.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <Card
                key={classroom.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => {
                  onSelectClassroom(classroom);
                  router.push(`/dashboard/student/classrooms/${classroom.id}`);
                }}
              >
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <Image
                    src={classroom.banner}
                    alt={classroom.name}
                    className="w-full h-full object-cover opacity-80"
                    width={500}
                    height={500}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white/90 mb-1">{classroom.code}</div>
                    <h3 className="text-white">{classroom.name}</h3>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => handleEditClick(e, classroom)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) =>
                        handleDeleteClick(e, classroom.id, classroom.name)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">SKS</span>
                      <span className="text-gray-900">
                        {classroom.credits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Jadwal</span>
                      <span className="text-gray-900 text-sm">
                        {getScheduleShort(classroom.schedule)}
                      </span>
                    </div>
                    {classroom.studentCount !== undefined && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {classroom.studentCount} Mahastudent
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateClassroomModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={onCreateClassroom}
        />

        <UpdateClassroomModal
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          onSubmit={onUpdateClassroom}
          classroom={selectedClassroom}
        />
      </div>

      <DashboardFooter />
    </div>
  );
}
