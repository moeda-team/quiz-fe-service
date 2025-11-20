// components/CreateClassModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Classroom } from "@/types/classroom";

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (classroom: Omit<Classroom, "id">) => void;
}

export default function CreateClassModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateClassModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [schedule, setSchedule] = useState("");
  const [banner, setBanner] = useState("");
  const [studentCount, setStudentCount] = useState("");

  const resetForm = () => {
    setCode("");
    setName("");
    setCredits("");
    setSchedule("");
    setBanner("");
    setStudentCount("");
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const creditsNum = credits ? Number(credits) : 0;
    const studentCountNum = studentCount
      ? Number(studentCount)
      : undefined;

    onSubmit({
      code,
      name,
      credits: creditsNum,
      schedule,
      banner:
        banner ||
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
      meetings: [],
      sessions: [],
      studentCount: studentCountNum,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Buat Kelas Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Kelas</Label>
              <Input
                id="code"
                placeholder="Contoh: IF402"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                placeholder="Contoh: Pemrograman Web Lanjut"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">SKS</Label>
              <Input
                id="credits"
                type="number"
                min={0}
                placeholder="Contoh: 3"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Jadwal</Label>
              <Textarea
                id="schedule"
                placeholder="Contoh: Senin & Rabu • 08:00 - 09:40"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentCount">Jumlah Mahastudent (opsional)</Label>
              <Input
                id="studentCount"
                type="number"
                min={0}
                placeholder="Contoh: 32"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner">URL Banner (opsional)</Label>
              <Input
                id="banner"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit">Buat Kelas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
