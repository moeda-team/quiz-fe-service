"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Upload, Save, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
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

// Themes are now fetched from useThemes hook

import { useQuizzes, Quiz } from "@/hooks/useQuizzes";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemes } from "@/hooks/useThemes";
import { useRef } from "react";
import { Plus } from "lucide-react";
import { Question } from "@/hooks/useQuestions";


export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuizById, updateQuiz, isLoading: isActionLoading } = useQuizzes();
  const { uploadFile, isUploading } = useFileUpload();
  const { themes, isLoading: isThemesLoading, addTheme, refreshThemes } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<'edit' | 'buat_soal'>('edit');
  const [questions, setQuestions] = useState<Question[]>([]);

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

  const coverImageValue = useWatch({ control: form.control, name: "coverImage" });

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id || themes.length === 0) return;
      try {
        const response = await getQuizById(params.id as string);
        const quizData: Quiz = ('data' in response && response.data) ? response.data : response as Quiz;
        
        // Set questions state
        if (quizData.questions && Array.isArray(quizData.questions)) {
          setQuestions(quizData.questions as Question[]);
        }

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
      } catch {
        toast.error("Gagal mengambil data kuis");
      } finally {
        setIsPageLoading(false);
      }
    };

    if (themes.length > 0) {
      fetchQuiz();
    }
  }, [params.id, getQuizById, form, themes]);

  // Set default theme when themes are loaded and no quiz data is loaded
  useEffect(() => {
    if (themes.length > 0 && !selectedTheme && !isPageLoading) {
      const defaultTheme = themes[0];
      form.setValue("themeId", defaultTheme.id);
      form.setValue("coverImage", defaultTheme.imageUrl);
      // Use setTimeout to defer state update and avoid cascading renders
      setTimeout(() => setSelectedTheme(defaultTheme.id), 0);
    }
  }, [themes, selectedTheme, form, isPageLoading]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "music"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const category = type === "image" ? "image" : "music";
      const context = "quiz";

      const response = await uploadFile(file, category, context);

      if (response) {
        if (type === "image") {
          // Create a new theme in master data
          try {
            const newTheme = await addTheme({
              name: `Tema Kustom ${new Date()}`,
              imageUrl: response.data.fileUrl
            });
            
            // Refresh themes to ensure new theme appears in UI
            await refreshThemes();
            
            form.setValue("themeId", newTheme.id);
            form.setValue("coverImage", response.data.fileUrl);
            setSelectedTheme(newTheme.id);
            toast.success("Tema kustom berhasil dibuat!");
          } catch (err: unknown) {
            // Fallback if theme creation fails but upload succeeded
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            form.setValue("coverImage", response.data.fileUrl);
            setSelectedTheme("custom");
            toast.error("Gagal mendaftarkan tema kustom: " + errorMessage);
          }
        } else {
          form.setValue("musicFile", response.data.fileUrl);
          toast.success("Musik berhasil diupload!");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Gagal upload ${type}: ` + errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Gagal memperbarui kuis: " + errorMessage);
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
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-main.webp"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-6 md:pt-10 pb-4 md:pb-6 px-4 sm:px-6 lg:px-8 min-h-0">
        {/* Header */}
        <header className="shrink-0">
          <div className="text-center">
            <div
              className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl text-black drop-shadow-xl tracking-wider text-shadow-lg text-shadow-amber-400 uppercase"
              style={{ fontFamily: 'Varela Round' }}
            >
              Empat Rima
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-2 flex-1 min-h-0 py-4">

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 -mb-5 flex-1 min-h-0">
            {/* Main Card Form */}
            <div
              className="flex-1 rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-0"
              style={{
                backgroundImage: 'url(/images/bg-card-list.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Varela Round'
              }}
            >
              {/* form edit */}
              {currentMode === 'edit' ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 flex flex-col">
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-2 md:gap-4">
                      <img src="/images/icon-title-l.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                      <div className="text-2xl md:text-3xl text-amber-950 tracking-tight">
                        EDIT KUIS
                      </div>
                      <img src="/images/icon-title-r.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                    </div>
                  </div>

                  {/* Form Content Scroll Area */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 space-y-4">
                    {/* Theme Selection Section */}
                    <div className="space-y-4">
                      <h2 className="text-xl md:text-2xl font-bold text-[#5d4037]">Pilih Tema Kuis</h2>
                      <div className="flex gap-6">
                        {/* Theme List */}
                        <div className="overflow-x-auto pb-4 flex-1">
                          <div className="flex gap-4 min-w-max p-1 px-2">
                            {isThemesLoading ? (
                              <div className="flex justify-center py-8 min-w-[200px]">
                                <div className="w-8 h-8 border-4 border-[#8d6e63] border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              themes.map((theme, index) => (
                                <div
                                  key={`${theme.id}-${index}`}
                                  onClick={() => {
                                    setSelectedTheme(theme.id);
                                    form.setValue("themeId", theme.id);
                                    form.setValue("coverImage", theme.imageUrl);
                                  }}
                                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer transition-all border-4 w-48 flex-shrink-0 ${
                                    selectedTheme === theme.id 
                                      ? "border-[#8d6e63] scale-105 shadow-lg" 
                                      : "border-transparent opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  {theme.imageUrl && theme.imageUrl.trim() !== "" ? (
                                    <Image 
                                      src={theme.imageUrl} 
                                      alt={theme.name || `Tema ${theme.id}`} 
                                      fill 
                                      className="object-cover" 
                                      loading="lazy" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-300 flex items-center justify-center">
                                      <span className="text-4xl">📚</span>
                                    </div>
                                  )}
                                  {selectedTheme === theme.id && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm bg-black/40 px-2 py-1 rounded">Dipilih</span>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Upload Own Theme - Fixed beside theme list */}
                        <div
                          onClick={() => coverImageInputRef.current?.click()}
                          className={`aspect-video rounded-xl border-2 border-dashed border-[#a1887f] bg-[#efebe9]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#efebe9] transition-colors gap-2 group w-48 flex-shrink-0 ${
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
                          {coverImageValue && selectedTheme === "custom" && coverImageValue?.trim() !== "" ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={coverImageValue || ""}
                                alt="Custom Cover"
                                fill
                                className="object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
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

                    {/* Quiz Details Section */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  className="bg-white/80 border-[#8b6056] border-2 h-12 rounded-xl focus:border-[#8d6e63] text-[#8b6056]"
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
                                    className="bg-white/80 border-[#8b6056] border-2 h-12 rounded-xl pr-12 focus:border-[#8d6e63] text-[#8b6056]"
                                  />
                                </FormControl>
                                <input
                                  type="file"
                                  ref={musicFileInputRef}
                                  className="hidden"
                                  accept="audio/*"
                                  onChange={(e) => handleFileUpload(e, "music")}
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
                              <Textarea
                                {...field}
                                placeholder="Contoh : Kuis ini bersifat pribadi, dilarang mencontek !!"
                                className="bg-white/80 border-[#8b6056] border-2 min-h-[150px] rounded-2xl focus:border-[#8d6e63] text-[#8b6056] resize-none p-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-4 gap-2">
                      <Button
                        type="submit"
                        disabled={isActionLoading}
                        className="bg-[#6d4c41] hover:bg-[#5d4037] text-white px-8 py-6 rounded-xl text-lg font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-70"
                      >
                        {isActionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {isActionLoading ? "Memperbarui..." : "Perbarui Kuis"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentMode('buat_soal');
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-6 rounded-xl text-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <Plus size={20} />
                        Buat Soal
                      </Button>
                    </div>
                  </div>
                  </form>
                </Form>
              ) : (
                // Buat Soal Form - 3-6-3 Column Layout
                <div className="flex-1 grid grid-cols-12 gap-6">
                  {/* Section 1 - Questions List */}
                  <div className="col-span-3 space-y-3 max-h-screen overflow-y-auto pr-2 border-r-2">
                    <div className="space-y-2">
                      {questions.map((question, index) => (
                        <div key={question.id} className="bg-[#f5f5f5] rounded-lg p-3 border border-[#d4c8c0]">
                          <p className="text-sm font-medium text-[#8b6056]">{index + 1}. {question.text}</p>
                        </div>
                      ))}

                      {questions.length === 0 && (
                        <div className="text-center text-gray-500 py-10 border-2 rounded-xl">
                          <p>Belum ada soal</p>
                        </div>
                      )}
                    </div>
                    <button className="w-full flex gap-2 items-center justify-center cursor-pointer bg-[#8d6e63] hover:bg-[#6d4c41] text-white rounded-sm p-2 font-bold transition-colors">
                      <Plus /> Tambah Soal
                    </button>
                  </div>

                  {/* Section 2 - Question Input & Image Upload */}
                  <div className="col-span-6 space-y-6 max-h-screen overflow-y-auto pr-2">
                    {/* form input question */}
                    <div>
                      <input 
                        type="text" 
                        className="w-full bg-white border-[#8b6056] border-2 rounded-md h-10 px-3 text-[#8b6056]" 
                        placeholder="Tulis soal anda"
                      />
                    </div>
                  </div>

                  {/* Section 3 - Settings & Answer Cards */}
                  <div className="col-span-3 space-y-6 max-h-screen overflow-y-auto pl-2 border-l-2">
                    {/* Settings Section */}
                    <div className="bg-white/90 border-2 border-[#8b6056] rounded-2xl p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#5d4037] font-bold mb-2">Tipe soal</label>
                          <select className="w-full bg-white border-[#8b6056] border-2 h-10 rounded-lg px-3 text-[#8b6056]">
                            <option>Benar atau Salah</option>
                            <option>Pilihan Ganda</option>
                            <option>Essay</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#5d4037] font-bold mb-2">Waktu</label>
                          <select className="w-full bg-white border-[#8b6056] border-2 h-10 rounded-lg px-3 text-[#8b6056]">
                            <option>10 Detik</option>
                            <option>20 Detik</option>
                            <option>30 Detik</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#5d4037] font-bold mb-2">Musik</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value="Default by Tema"
                              readOnly
                              className="w-full bg-white border-[#8b6056] border-2 h-10 rounded-lg px-3 pr-10 text-[#8b6056]"
                            />
                            <button className="absolute right-2 top-2 text-[#8d6e63] hover:text-[#5d4037]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button className="bg-[#6d4c41] hover:bg-[#5d4037] text-white px-8 py-3 rounded-xl font-bold transition-colors">
                        Simpan Kuis
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* form-question */}

            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Link href="/host" className="fixed top-6 left-6 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft size={24} />
      </Link>

      {/* Settings/Volume Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button className="w-12 h-12 md:w-14 md:h-14 bg-amber-100/90 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-amber-700/20 hover:bg-white transition-all group active:scale-90">
          <svg className="w-6 h-6 md:w-7 md:h-7 text-amber-700 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.983 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(120, 53, 15, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 53, 15, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 53, 15, 0.5);
        }
      `}</style>
    </div>
  );
}
