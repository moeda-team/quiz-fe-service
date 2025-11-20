// components/ClassroomDetail.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Presentation,
  Video,
  Clock,
  Download,
  ChevronUp,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { Classroom } from "@/types/classroom";
import { useBreadcrumbStore } from "@/stores/breadcrumb-store";
import Image from "next/image";

interface ClassroomDetailProps {
  classroom?: Classroom | null;
}

export default function ClassroomDetail({ classroom }: ClassroomDetailProps) {
  const { setBreadcrumbs, resetBreadcrumbs } = useBreadcrumbStore();

  // --- Safe derivation dari classroom (boleh undefined/null) ---
  const meetings = classroom?.meetings ?? [];
  const sessions = classroom?.sessions ?? [];
  const hasMeetings = meetings.length > 0;
  const hasSessions = sessions.length > 0;

  const classroomLabel = classroom
    ? `${classroom.code} - ${classroom.name}`
    : "Kelas tidak ditemukan";

  const bannerSrc =
    classroom?.banner ??
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80";

  const scheduleLabel = classroom?.schedule ?? "-";
  const creditsLabel = classroom ? `${classroom.credits} SKS` : "-";

  // --- State hooks (selalu dipanggil, tidak di dalam kondisi/return) ---
  const [selectedMeeting, setSelectedMeeting] = useState(
    hasMeetings ? meetings[0] : null
  );

  const [selectedSession, setSelectedSession] = useState(
    hasSessions ? sessions[0] : null
  );

  const [expandedMaterials, setExpandedMaterials] = useState<string[]>([]);

  // Sync state kalau classroom / daftar meeting/sesi berubah
  useEffect(() => {
    // setSelectedMeeting(hasMeetings ? meetings[0] : null);
    // setSelectedSession(hasSessions ? sessions[0] : null);
    // setExpandedMaterials([]);
  }, [hasMeetings, hasSessions, meetings, sessions]);

  // Breadcrumb global
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Kelas", href: "/dashboard/student/classrooms" },
      { label: classroomLabel },
    ]);

    return () => {
      resetBreadcrumbs();
    };
  }, [setBreadcrumbs, resetBreadcrumbs, classroomLabel]);

  const toggleMaterial = (materialId: string) => {
    setExpandedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };
  
  useEffect(() => {
    setBreadcrumbs([
      { label: "Kelas", href: "/dashboard/student/classrooms" },
      { label: classroomLabel },
    ]);

    return () => {
      resetBreadcrumbs();
    };
  }, [setBreadcrumbs, resetBreadcrumbs, classroomLabel]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">

      {/* Banner */}
      <div className="bg-white border-b">
        <div className="mx-auto">
          <div className="relative h-32 overflow-hidden">
            <Image
              src={bannerSrc}
              alt={classroomLabel}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            <div className="absolute inset-0 flex items-center px-6 max-w-[1400px] mx-auto">
              <div className="text-white">
              <h1 className="text-xl md:text-2xl font-semibold mb-1">
                {classroomLabel}
              </h1>
                <p className="text-sm text-white/90">
                  {creditsLabel} · Kuliah Blended Kampus
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Lihat Profil Kelas
            </Button>
          </div>
          <div className="px-6 py-3 bg-gray-50 flex items-center gap-6 text-sm max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{scheduleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kalau classroom null/undefined, tampilkan info sederhana */}
      {!classroom && (
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-600">
              Data kelas tidak ditemukan.
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {classroom && (
        <div className="mx-auto px-6 py-6 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar: Meetings */}
            <aside className="w-full lg:w-64 shrink-0 space-y-2">
              {!hasMeetings && (
                <Card>
                  <CardContent className="p-4 text-sm text-gray-500">
                    Belum ada pertemuan terdaftar.
                  </CardContent>
                </Card>
              )}

              {hasMeetings &&
                meetings.map((meeting) => {
                  const isActive =
                    selectedMeeting && selectedMeeting.id === meeting.id;

                  return (
                    <button
                      key={meeting.id}
                      type="button"
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {meeting.title}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          {meeting.hasDocument && (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          {meeting.hasPresentation && (
                            <Presentation className="w-3.5 h-3.5" />
                          )}
                          {meeting.hasVideo && (
                            <Video className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            meeting.status === "online"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            meeting.status === "online"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : ""
                          }
                        >
                          {meeting.status === "online" ? "Online" : "Offline"}
                        </Badge>
                        {meeting.statusLabel && (
                          <span className="text-xs text-gray-600">
                            {meeting.statusLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </aside>

            {/* Main Content: Session Detail */}
            <section className="flex-1">
              <Card>
                <CardContent className="p-6">
                  {!selectedSession ? (
                    <div className="text-center text-sm text-gray-500 py-10">
                      Belum ada sesi untuk ditampilkan.
                    </div>
                  ) : (
                    <>
                      {/* Header session */}
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">
                          {selectedSession.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{selectedSession.date}</span>
                          </div>
                          <span>•</span>
                          <span>{selectedSession.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            Pertemuan 1
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {selectedSession.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="space-y-3">
                        {selectedSession.materials.map((material) => {
                          const isExpanded = expandedMaterials.includes(
                            material.id
                          );

                          return (
                            <div
                              key={material.id}
                              className="border rounded-lg bg-white"
                            >
                              <button
                                type="button"
                                onClick={() => toggleMaterial(material.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {material.title}
                                  </span>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-4 border-t">
                                  <div className="pt-4 space-y-4 text-sm">
                                    {material.type === "audio" &&
                                      material.audioUrl && (
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-yellow-600">
                                              ▶
                                            </span>
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-xs">
                                                12:31
                                              </span>
                                              <div className="flex-1 h-1 bg-blue-500 rounded-full" />
                                              <span className="text-xs text-gray-600">
                                                {material.duration}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {material.content && (
                                      <p className="text-gray-700 leading-relaxed">
                                        {material.content}
                                      </p>
                                    )}

                                    {material.downloadUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <a href={material.downloadUrl}>
                                          <Download className="w-4 h-4 mr-2" />
                                          Unduh
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Description */}
                      {selectedSession.description && (
                        <div className="mt-6 pt-6 border-t">
                          <h3 className="mb-2 text-sm font-semibold">
                            Deskripsi
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedSession.description}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Right Sidebar: Aktivitas */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <Tabs defaultValue="aktivitas" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
                </TabsList>
                <TabsContent value="aktivitas" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center text-gray-500 py-8 text-sm">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>Belum ada aktivitas</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
