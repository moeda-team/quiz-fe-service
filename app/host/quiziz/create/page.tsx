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

// Themes are now fetched from useThemes hook

import { useQuizzes } from "@/hooks/useQuizzes";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemes } from "@/hooks/useThemes";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";

export default function CreateQuizPage() {
  const router = useRouter();
  const { createQuiz, isLoading: isMutating } = useQuizzes();
  const { uploadFile, isUploading } = useFileUpload();
  const { themes, isLoading: isThemesLoading, addTheme, refreshThemes } = useThemes();
  const { setQuizMusic, togglePlayPause, pauseMusic, isPlaying, currentMusicUrl } = useMusicPlayer();
  const [selectedTheme, setSelectedTheme] = useState<string>("");

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

  // Set default theme when themes are loaded
  useEffect(() => {
    if (themes.length > 0 && !selectedTheme) {
      const defaultTheme = themes[0];
      setSelectedTheme(defaultTheme.id);
      form.setValue("themeId", defaultTheme.id);
      form.setValue("coverImage", defaultTheme.imageUrl);
    }
  }, [themes, selectedTheme, form]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "music"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const category = type === "image" ? "image" : "music";
      const context = "quiz"; // Using quiz as context

      const response = await uploadFile(file, category, context);

      if (response) {
        if (type === "image") {
          // Create a new theme in master data
          try {
            const newTheme = await addTheme({
              name: `Tema Kustom ${new Date()}`,
              imageUrl: response.data.fileUrl
            }) as { id: string; name: string; imageUrl: string };
            
            // Refresh themes to ensure new theme appears in UI
            await refreshThemes();
            
            form.setValue("themeId", newTheme.id);
            form.setValue("coverImage", response.data.fileUrl);
            setSelectedTheme(newTheme.id);
            toast.success("Tema kustom berhasil dibuat!");
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            // Fallback if theme creation fails but upload succeeded
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

  const handlePlayMusic = () => {
    const musicUrl = form.getValues("musicFile") || "/media/default.mp3";
    
    setQuizMusic(musicUrl);
    
    // Force play after setting the music
    setTimeout(() => {
      togglePlayPause();
    }, 100);
  };

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const payload = {
        title: data.title,
        instructions: data.instructions,
        coverImage: data.coverImage,
        musicFile: data.musicFile || "/media/default.mp3",
        questions: [], // Empty array for new quiz
        isPublished: false,
      };

      const res = await createQuiz(payload);
      
      if (res?.id) {
        toast.success("Kuis berhasil disimpan!");
        router.push(`/host/quiziz/edit/${res.id}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Gagal menyimpan kuis: " + errorMessage);
    }
  };

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
              className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-black drop-shadow-xl tracking-wider text-shadow-lg text-shadow-amber-400 uppercase"
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
              className="flex-1 rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-0 max-h-full"
              style={{
                backgroundImage: 'url(/images/bg-card-list.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Varela Round'
              }}
            >
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className="flex-1 space-y-2 flex flex-col min-h-0"
                >
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 shrink-0">
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                      <img src="/images/icon-title-l.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                      <div className="text-2xl md:text-3xl text-black tracking-tight">
                        Pilih Tema Kuis
                      </div>
                      <img src="/images/icon-title-r.svg" alt="icon" className="w-8 h-8 md:w-12 md:h-12 animate-bounce" />
                    </div>
                  </div>

                  {/* Form Content Scroll Area */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 space-y-2">
                    {/* Theme Selection Section */}
                    <div className="space-y-4">
                      <div className="gap-6 grid grid-cols-4">
                        {/* Theme List */}
                        <div className="overflow-x-auto flex-1 col-span-4 lg:col-span-3 xs:col-span-2 md:col-span-2">
                          <div className="flex gap-4 min-w-max p-1 px-2">
                            {isThemesLoading ? (
                              <div className="flex justify-center py-8 min-w-[200px]">
                                <div className="w-8 h-8 border-4 border-[#C9750A] border-t-transparent rounded-full animate-spin" />
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
                                      ? "border-[#C9750A] scale-105 shadow-lg" 
                                      : "border-transparent opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  {theme.imageUrl && theme.imageUrl.trim() !== "" ? (
                                    <img 
                                      src={theme.imageUrl} 
                                      alt={theme.name || `Tema ${theme.id}`} 
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
                          className={`aspect-video rounded-xl col-span-4 lg:col-span-1 w-full h-26 lg:w-48 border-2 border-dashed border-[#C9750A] bg-[#efebe9]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#efebe9] transition-colors gap-2 group flex-shrink-0 ${
                            selectedTheme === "custom" ? "border-[#C9750A] bg-[#efebe9]" : ""
                          }`}
                        >
                          <input
                            type="file"
                            ref={coverImageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "image")}
                          />
                          {form.watch("coverImage") && selectedTheme === "custom" && form.watch("coverImage")?.trim() !== "" ? (
                            <div className="relative w-full h-full">
                              <img
                                src={form.watch("coverImage") || ""}
                                alt="Custom Cover"
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
                              <div className="w-10 h-10 rounded-lg bg-#C9750A flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                {isUploading ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-8 h-8 text-[#C9750A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
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
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-black font-bold text-lg">Judul Kuis</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Contoh : Pre Test - Mengenal Budaya Sunda"
                                  className="bg-white/80 border-[#C9750A] border-2 h-12 rounded-xl focus:border-[#C9750A] text-black"
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
                              <FormLabel className="text-black font-bold text-lg">Musik</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Naik Odong Odong.mp3"
                                    className="bg-white/80 border-[#C9750A] border-2 h-12 rounded-xl pr-24 focus:border-[#C9750A] text-black"
                                    readOnly
                                    onChange={(e) => handleFileUpload(e, "music")}
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
                                  className="absolute border-l right-12 top-0 h-full w-12 bg-#C9750A rounded-r-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#795548] transition-colors"
                                >
                                  {isUploading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Upload size={20} color="#C9750A" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={handlePlayMusic}
                                  className="absolute right-0 top-0 h-full w-12 bg-[#795548] rounded-r-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#5d4037] transition-colors border-l border-white/20"
                                  title="Play Music"
                                >
                                  {isPlaying && currentMusicUrl === field.value ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
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
                            <FormLabel className="text-black font-bold text-lg">Instruksi Kuis</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Contoh : Kuis ini bersifat pribadi, dilarang mencontek !!"
                                className="bg-white/80 border-[#C9750A] border-2 min-h-[150px] rounded-2xl focus:border-[#C9750A] text-black resize-none p-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isMutating}
                        className="bg-[#C9750A] hover:bg-[#5d4037] text-white px-8 py-6 rounded-xl text-lg font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-70"
                      >
                        {isMutating ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {isMutating ? "Menyimpan..." : "Simpan dan Lanjutkan"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>

          </div>
        </div>
      </div>

      {/* Back Button */}
      <Link href="/host" className="fixed top-6 left-6 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft size={24} />
      </Link>

      {/* Global Music Player */}
      <GlobalMusicPlayer />

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
