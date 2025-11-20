// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { Calendar, Search, Star, Plus, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import DashboardLayout from "@/components/layout/student/DashboardLayout";

/* ===== Types ===== */
type MaterialType = "video" | "pdf" | "quiz";

interface CourseMaterial {
  id: string;
  title: string;
  type: MaterialType;
}

interface Course {
  id: string;
  title: string;
  mentor?: string;
  duration?: string;
  progress: number;
  materials: CourseMaterial[];
}

/* ===== Mock data sementara (nantinya bisa dari DB / API) ===== */
const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "UI/UX Design Fundamentals",
    mentor: "Amanda Blake",
    duration: "12h 30m",
    progress: 65,
    materials: [
      { id: "m1", title: "Intro", type: "video" },
      { id: "m2", title: "Figma Basics", type: "video" },
      { id: "m3", title: "Wireframing", type: "video" },
    ],
  },
  {
    id: "course-2",
    title: "Product Management 101",
    mentor: "John Carter",
    duration: "8h 10m",
    progress: 30,
    materials: [
      { id: "m4", title: "What is PM?", type: "video" },
      { id: "m5", title: "Roadmaps", type: "video" },
      { id: "m6", title: "Docs", type: "pdf" },
    ],
  },
];

/* ===== Sidebar Component (kiri) ===== */
function DashboardSidebar() {
  return (
    <div className="w-full md:w-72 flex-shrink-0 space-y-6">
      {/* Hero Section */}
      <div>
        <h1 className="mb-2 text-xl md:text-2xl">
          Certified <span className="text-blue-600">online courses</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base">For Professionals</p>
      </div>

      {/* Upcoming Tests */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-base">Upcoming Tests</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span>🎨</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-900 text-sm md:text-base">
                    Journey Mapping
                  </span>
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-600 text-xs">
                  <span>📱</span>
                  <span>UI/UX Design</span>
                  <span>•</span>
                  <span>15 May</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span>💡</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-900 text-sm md:text-base">
                    Usability Testing
                  </span>
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-base">Messages</h3>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Star className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 text-sm md:text-base">
                    Amanda
                  </span>
                  <span className="text-green-500">●</span>
                </div>
                <p className="text-gray-600 text-xs md:text-sm truncate">
                  ✍️ Sloan is typing...
                </p>
              </div>
              <Badge variant="destructive" className="rounded-full">
                2
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 text-sm md:text-base">
                  Johnson
                </span>
                <p className="text-gray-600 text-xs md:text-sm truncate">
                  🎤 Voice message
                </p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-red-100 text-red-600">
                    L
                  </AvatarFallback>
                </Avatar>
                <span className="text-red-600 text-xs">Live</span>
                <span className="text-gray-400 text-xs">15:25</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center -space-x-2">
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs">2</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===== Main Content Component (kanan) ===== */
function DashboardMain({ courses }: { courses: Course[] }) {
  const activeCourses = courses.filter((c) => c.progress && c.progress > 0);

  return (
    <div className="flex-1 space-y-6">
      {/* Premium Banner */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-0">
            <div className="text-center md:text-left">
              <p className="text-gray-600 mb-2 text-sm md:text-base">Minton</p>
              <h2 className="mb-2 text-xl md:text-2xl">Go premium</h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Explore 500+ courses with lifetime membership
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Get Access
              </Button>
            </div>
            <div className="w-24 h-20 md:w-64 md:h-32 flex items-center justify-center">
              <div className="text-5xl md:text-8xl">✌️</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and To Do List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="mb-6 text-base md:text-lg">Progress</h3>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-gray-600 mb-2 text-sm">Hours Spent</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl text-gray-900">
                    21.2K
                  </span>
                </div>
                <Badge className="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-100">
                  +18.5%
                </Badge>
              </div>
              <div className="flex-1 flex items-end gap-2 h-24 md:h-32">
                <div
                  className="flex-1 bg-purple-200 rounded-t"
                  style={{ height: "40%" }}
                />
                <div
                  className="flex-1 bg-purple-200 rounded-t"
                  style={{ height: "55%" }}
                />
                <div
                  className="flex-1 bg-purple-200 rounded-t"
                  style={{ height: "45%" }}
                />
                <div
                  className="flex-1 bg-purple-500 rounded-t relative"
                  style={{ height: "85%" }}
                >
                  <div className="absolute -top-7 md:-top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[10px] md:text-xs whitespace-nowrap">
                    5.5 hrs
                  </div>
                </div>
                <div
                  className="flex-1 bg-purple-200 rounded-t"
                  style={{ height: "35%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* To Do List */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg">To Do List</h3>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="relative">
                    <svg className="w-10 h-10 md:w-12 md:h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeDasharray={`${80 * 1.256} ${100 * 1.256}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs">
                      80%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm md:text-base">
                    Research Objective User
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">
                    You marked 3/5 subtasks are done 🎉
                  </p>
                </div>
                <Checkbox />
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="relative">
                    <svg className="w-10 h-10 md:w-12 md:h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeDasharray={`${25 * 1.256} ${100 * 1.256}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs">
                      25%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm md:text-base">
                    Art and Design
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">
                    You marked 4/4 subtasks are done 🎊
                  </p>
                </div>
                <Checkbox checked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course You're Taking */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg">Course You&apos;re Taking</h2>
              <Badge variant="secondary">{activeCourses.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Active
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {activeCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/student/courses/${course.id}`}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {course.title.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm md:text-base">{course.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600 text-xs md:text-sm">
                      Mentor
                    </span>
                    <div className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="text-xs">
                          {course.mentor?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-900 text-xs md:text-sm">
                        {course.mentor}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-gray-600 text-xs md:text-sm">
                    <p>Duration</p>
                    <p className="text-gray-900">{course.duration}</p>
                  </div>

                  <div className="w-24 md:w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs md:text-sm">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-gray-600 text-xs md:text-sm">
                    <span>
                      {
                        course.materials.filter((m) => m.type === "video")
                          .length
                      }
                      /8
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>1k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📁</span>
                      <span>16</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===== Page (server component) ===== */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const courses = mockCourses;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-black">
      <DashboardLayout>
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar di atas saat mobile, di kiri saat desktop */}
            <DashboardSidebar />
            <DashboardMain courses={courses} />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
