"use client";

import { toast } from "sonner";


import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Music, Save, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const quizSchema = z.object({
  title: z.string().min(3, "Judul kuis minimal 3 karakter"),
  instructions: z.string().min(10, "Instruksi minimal 10 karakter"),
  themeId: z.string().min(1, "Pilih tema kuis"),
  coverImage: z.string().optional(),
  musicFile: z.string().optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const themes = [
  {
    id: "theme-1",
    name: "Kemerdekaan",
    image: "/theme_thumbnail_independence_1777210075405.png",
  },
  {
    id: "theme-2",
    name: "Pesan Bijak",
    image: "/theme_thumbnail_scroll_1777210101541.png",
  },
  {
    id: "theme-3",
    name: "Budaya Bali 1",
    image: "/theme_thumbnail_bali_1777209991305.png",
  },
  {
    id: "theme-4",
    name: "Budaya Bali 2",
    image: "/theme_thumbnail_bali_1777209991305.png", // Reuse for demo
  },
];

import { useQuizzes } from "@/hooks/useQuizzes";
import { useRouter } from "next/navigation";

export default function CreateQuizPage() {
  const router = useRouter();
  const { createQuiz, isLoading: isMutating } = useQuizzes();
  const [selectedTheme, setSelectedTheme] = useState<string>("theme-2");

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      instructions: "",
      themeId: "theme-2",
      coverImage: "",
      musicFile: "",
    },
  });



  const onSubmit = async (data: QuizFormValues) => {
    try {
      const payload = {
        ...data,
        themeId: '1a0206aa-72b6-4c83-b258-3a8c4bce9b1c',
        musicFile: "https://drive.google.com/file/d/1Wc1vG4p11U6r871F-x95j9L36U-iG4U7/preview",
        coverImage: data.coverImage || themes.find(t => t.id === selectedTheme)?.image || "",
      };

      console.log("Submitting Payload:", payload);

      await createQuiz(payload);
      toast.success("Kuis berhasil disimpan!");
      router.push("/host");
    } catch (err: any) {
      toast.error("Gagal menyimpan kuis: " + err.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg_quiz_create_1777209854215.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl h-auto min-h-[600px] bg-[#fdf6e9] rounded-[2.5rem] shadow-2xl border-[12px] border-[#e2d1b5] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="w-full py-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#4a3427] tracking-widest drop-shadow-sm uppercase" style={{ fontFamily: 'Varela Round' }}>
            PANDAI KUIS
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 px-8 md:px-12 pb-10 space-y-8">
            {/* Theme Selection */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#5d4037]">Pilih Tema Kuis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      form.setValue("themeId", theme.id);
                    }}
                    className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${selectedTheme === theme.id ? "border-[#8d6e63] scale-105 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                  >
                    <Image src={theme.image} alt={theme.name} fill className="object-cover" />
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-black/40 px-2 py-1 rounded">Dipilih</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Upload Own Theme */}
                <div className="aspect-video rounded-xl border-2 border-dashed border-[#a1887f] bg-[#efebe9]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#efebe9] transition-colors gap-2 group">
                  <div className="w-10 h-10 rounded-lg bg-[#8d6e63] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-[#5d4037] text-center px-2">Upload Gambar Sendiri</span>
                </div>
              </div>
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5d4037] font-bold text-lg">Judul Kuis</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contoh : Pre Test - Mengenal Budaya Sunda"
                        className="bg-white/80 border-[#d7ccc8] border-2 h-12 rounded-xl focus:border-[#8d6e63] text-[#4e342e]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="musicFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5d4037] font-bold text-lg">Musik</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Naik Odong Odong.mp3"
                          className="bg-white/80 border-[#d7ccc8] border-2 h-12 rounded-xl pr-12 focus:border-[#8d6e63] text-[#4e342e]"
                        />
                      </FormControl>
                      <div className="absolute right-0 top-0 h-full w-12 bg-[#8d6e63] rounded-r-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#795548] transition-colors">
                        <Upload size={20} />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#5d4037] font-bold text-lg">Instruksi Kuis</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Contoh : Kuis ini bersifat pribadi, dilarang mencontek !!"
                      className="bg-white/80 border-[#d7ccc8] border-2 min-h-[150px] rounded-2xl focus:border-[#8d6e63] text-[#4e342e] resize-none p-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer Buttons */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isMutating}
                className="bg-[#6d4c41] hover:bg-[#5d4037] text-white px-8 py-6 rounded-xl text-lg font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-70"
              >
                {isMutating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {isMutating ? "Menyimpan..." : "Simpan dan Lanjutkan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Close/Back Button */}
      <Link href="/host" className="fixed top-6 left-6 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft size={24} />
      </Link>
    </div>
  );
}
