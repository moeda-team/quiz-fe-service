// app/dashboard/classrooms/mockClassrooms.ts
import type { Classroom } from "@/types/classroom";

export const initialClassrooms: Classroom[] = [
  {
    id: "cls-1",
    code: "IF402",
    name: "Pemrograman Web Lanjut",
    credits: 3,
    schedule: "Senin, 08:00 - 09:40 WIB • Rabu, 08:00 - 09:40 WIB",
    banner:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    meetings: [],
    sessions: [],
    studentCount: 32,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "cls-2",
    code: "IF305",
    name: "Struktur Data & Algoritma",
    credits: 3,
    schedule: "Selasa, 10:00 - 11:40 WIB",
    banner:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    meetings: [],
    sessions: [],
    studentCount: 45,
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "cls-3",
    code: "IF210",
    name: "Pengantar Kecerdasan Buatan",
    credits: 2,
    schedule: "Kamis, 13:00 - 14:40 WIB",
    banner:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    meetings: [],
    sessions: [],
    studentCount: 27,
    createdAt: "2025-01-03T00:00:00.000Z",
  },
];
