// components/UpdateClassroomModal.tsx
"use client";

import type { FormEvent } from "react";
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

interface UpdateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (classroom: Classroom) => void;
  classroom: Classroom | null;
}

export default function UpdateClassroomModal({
  open,
  onOpenChange,
  onSubmit,
  classroom,
}: UpdateClassroomModalProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!classroom) return;

    const formData = new FormData(e.currentTarget);

    const code = String(formData.get("code") ?? "");
    const name = String(formData.get("name") ?? "");
    const creditsRaw = String(formData.get("credits") ?? "");
    const schedule = String(formData.get("schedule") ?? "");
    const banner = String(formData.get("banner") ?? "");
    const studentCountRaw = String(formData.get("studentCount") ?? "");

    const credits = creditsRaw ? Number(creditsRaw) : 0;
    const studentCount = studentCountRaw
      ? Number(studentCountRaw)
      : undefined;

    onSubmit({
      ...classroom,
      code,
      name,
      credits,
      schedule,
      banner,
      studentCount,
    });

    onOpenChange(false);
  };

  // Kalau belum ada classroom, jangan render form (hindari error)
  const isReady = Boolean(classroom);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
        </DialogHeader>

        {isReady && (
          <form key={classroom!.id} onSubmit={handleSubmit}>
            {/* key=classroom.id memastikan form reset kalau classroom berganti */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Kode Kelas</Label>
                <Input
                  id="edit-code"
                  name="code"
                  placeholder="Contoh: IPA301"
                  defaultValue={classroom!.code}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Kelas</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Contoh: Ilmu Pengetahuan Alam"
                  defaultValue={classroom!.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-credits">SKS</Label>
                <Input
                  id="edit-credits"
                  name="credits"
                  type="number"
                  min={0}
                  placeholder="Contoh: 3"
                  defaultValue={classroom!.credits}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-schedule">Jadwal</Label>
                <Textarea
                  id="edit-schedule"
                  name="schedule"
                  placeholder="Contoh: Senin, 17:00 - 19:00 WIB • Rabu, 17:00 - 18:00 WIB"
                  defaultValue={classroom!.schedule}
                  required
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-studentCount">
                  Jumlah Mahastudent (opsional)
                </Label>
                <Input
                  id="edit-studentCount"
                  name="studentCount"
                  type="number"
                  min={0}
                  placeholder="Contoh: 235"
                  defaultValue={
                    classroom!.studentCount !== undefined
                      ? classroom!.studentCount
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-banner">URL Banner</Label>
                <Input
                  id="edit-banner"
                  name="banner"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={classroom!.banner}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
