"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Upload, Music, Save, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useQuizzes } from "@/hooks/useQuizzes";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemes } from "@/hooks/useThemes";
import { useRef } from "react";

const quizSchema = z.object({
  title: z.string().min(3, "Judul kuis minimal 3 karakter"),
  instructions: z.string().min(10, "Instruksi minimal 10 karakter"),
  themeId: z.string().min(1, "Pilih tema kuis"),
  coverImage: z.string().optional(),
  musicFile: z.string().optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

// Themes are now fetched from useThemes hook

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuizById, updateQuiz, isLoading: isActionLoading } = useQuizzes();
  const { uploadFile, isUploading } = useFileUpload();
  const { themes, isLoading: isThemesLoading } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      instructions: "",
      themeId: "",
      coverImage: "",
      musicFile: "/media/default.mp3",
    },
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id || themes.length === 0) return;
      try {
        const response = await getQuizById(params.id as string);
        const quizData = response.data || response;

        // Map API response to form values
        const themeId = quizData.themeId || quizData.theme_id || "";
        const isDefaultTheme = themes.some(t => t.id === themeId);

        form.reset({
          title: quizData.title || quizData.name || "",
          instructions: quizData.instructions || quizData.description || "",
          themeId: themeId,
          coverImage: quizData.coverImage || quizData.image || quizData.cover_image || "",
          musicFile: quizData.musicFile || quizData.music_file || "/media/default.mp3",
        });
        
        setSelectedTheme(isDefaultTheme ? themeId : (themeId ? "custom" : ""));
      } catch (err) {
        toast.error("Gagal mengambil data kuis");
      } finally {
        setIsPageLoading(false);
      }
    };

    if (themes.length > 0) {
      fetchQuiz();
    }
  }, [params.id, getQuizById, form, themes]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const category = type === "image" ? "image" : "audio";
      const context = "quiz";
      
      const response = await uploadFile(file, category, context);
      
      if (response.success) {
        if (type === "image") {
          form.setValue("coverImage", response.data.url);
          setSelectedTheme("custom");
          toast.success("Gambar berhasil diupload!");
        } else {
          form.setValue("musicFile", response.data.url);
          toast.success("Musik berhasil diupload!");
        }
      }
    } catch (err: any) {
      toast.error(`Gagal upload ${type}: ` + err.message);
    }
  };

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const payload = {
        ...data,
        themeId: selectedTheme === "custom" ? "1a0206aa-72b6-4c83-b258-3a8c4bce9b1c" : data.themeId,
        coverImage: data.coverImage,
      };

      await updateQuiz(params.id as string, payload);
      toast.success("Kuis berhasil diperbarui!");
      router.push("/host");
    } catch (err: any) {
      toast.error("Gagal memperbarui kuis: " + err.message);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-700 animate-spin" />
          <p className="text-amber-900 font-bold">Memuat data kuis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={form.watch("coverImage") || "/bg_quiz_create_1777209854215.png"}
          alt="Background"
          fill
          className="object-cover transition-all duration-500"
          priority
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl h-auto min-h-[600px] bg-[#fdf6e9] rounded-[2.5rem] shadow-2xl border-[12px] border-[#e2d1b5] overflow-hidden flex flex-col">
        <div className="w-full py-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#4a3427] tracking-widest drop-shadow-sm uppercase" style={{ fontFamily: 'Varela Round' }}>
            EDIT KUIS
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 px-8 md:px-12 pb-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#5d4037]">Pilih Tema Kuis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {isThemesLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#8d6e63] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => {
                        setSelectedTheme(theme.id);
                        form.setValue("themeId", theme.id);
                        form.setValue("coverImage", theme.imageUrl);
                      }}
                      className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${selectedTheme === theme.id ? "border-[#8d6e63] scale-105 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"}`}
                    >
                      <Image src={theme.imageUrl} alt={theme.name} fill className="object-cover" />
                      {selectedTheme === theme.id && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white font-bold text-sm bg-black/40 px-2 py-1 rounded">Dipilih</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {/* Upload Own Theme */}
                <div
                  onClick={() => coverImageInputRef.current?.click()}
                  className={`aspect-video rounded-xl border-2 border-dashed border-[#a1887f] bg-[#efebe9]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#efebe9] transition-colors gap-2 group ${
                    selectedTheme === "custom" ? "border-[#8d6e63] bg-[#efebe9]" : ""
                  }`}
                >
                  <input
                    type="file"
                    ref={coverImageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                  {form.watch("coverImage") && selectedTheme === "custom" ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={form.watch("coverImage") || ""}
                        alt="Custom Cover"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px] bg-black/40 px-2 py-1 rounded">
                          Terganti
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-[#8d6e63] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={20} />
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-[#5d4037] text-center px-2">
                        {isUploading ? "Uploading..." : "Upload Gambar Sendiri"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5d4037] font-bold text-lg">Judul Kuis</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/80 border-[#d7ccc8] border-2 h-12 rounded-xl focus:border-[#8d6e63] text-[#4e342e]" />
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
                          placeholder="Pilih file musik..."
                          className="bg-white/80 border-[#d7ccc8] border-2 h-12 rounded-xl pr-12 focus:border-[#8d6e63] text-[#4e342e]"
                        />
                      </FormControl>
                      <input
                        type="file"
                        ref={musicFileInputRef}
                        className="hidden"
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, "audio")}
                      />
                      <div
                        onClick={() => musicFileInputRef.current?.click()}
                        className="absolute right-0 top-0 h-full w-12 bg-[#8d6e63] rounded-r-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#795548] transition-colors"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={20} />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#5d4037] font-bold text-lg">Instruksi Kuis</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-white/80 border-[#d7ccc8] border-2 min-h-[150px] rounded-2xl focus:border-[#8d6e63] text-[#4e342e] resize-none p-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isActionLoading}
                className="bg-[#6d4c41] hover:bg-[#5d4037] text-white px-8 py-6 rounded-xl text-lg font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-70"
              >
                {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                {isActionLoading ? "Memperbarui..." : "Perbarui Kuis"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Link href="/host" className="fixed top-6 left-6 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft size={24} />
      </Link>
    </div>
  );
}
