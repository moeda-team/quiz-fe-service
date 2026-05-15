"use client";

import { toast } from "sonner";
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Upload, Save, ChevronLeft, Loader2, Trash2 } from "lucide-react";
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
import { Question, useQuestions } from "@/hooks/useQuestions";


export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuizById, updateQuiz, isLoading: isActionLoading } = useQuizzes();
  const { deleteQuestion } = useQuestions();
  const { uploadFile, isUploading } = useFileUpload();
  const { themes, isLoading: isThemesLoading, addTheme, refreshThemes } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<'edit' | 'buat_soal'>('edit');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionImageUploading, setQuestionImageUploading] = useState(false);
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [buatSoalMusicUrl, setBuatSoalMusicUrl] = useState("");
  
  // Question creation form state
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
    timeLimit: number;
    options: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
      points: number;
      imageUrl?: string;
    }>;
    musicFile?: string;
    imageUrl?: string;
  }>({
    text: "",
    type: "MULTIPLE_CHOICE",
    timeLimit: 30,
    imageUrl: "",
    musicFile: "",
    options: [
      { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
      { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
    ]
  });

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const buatSoalMusicFileInputRef = useRef<HTMLInputElement>(null);

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
    type: "image" | "music" | "questionImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === "questionImage") {
        setQuestionImageUploading(true);
        // For question image, we don't need to create a theme
        // Just handle the upload and store the URL in state
        const response = await uploadFile(file, "image", "question");
        if (response) {
          toast.success("Gambar soal berhasil diupload!");
          setQuestionImageUrl(response.data.fileUrl);
        }
        setQuestionImageUploading(false);
      } else {
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
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Gagal upload ${type}: ` + errorMessage);
      if (type === "questionImage") {
        setQuestionImageUploading(false);
      }
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

  const handleDeleteQuestion = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Soal?',
      text: 'Soal yang dihapus tidak dapat dikembalikan lagi!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteQuestion(params.id as string, id);
        const newQuestions = questions.filter(q => q.id !== id);
        setQuestions(newQuestions);
        toast.success("Soal berhasil dihapus");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error("Gagal menghapus soal: " + errorMessage);
      }
    }
  };

  const handleEditQuestion = (id: string) => {
    // Find the question by ID
    const questionToEdit = questions.find(q => q.id === id);
    if (questionToEdit) {
      console.log(questionToEdit)
    }
  };

  const onsubmitSoal = async () => {
    try {
      // Validate required fields
      if (!newQuestion.text.trim()) {
        toast.error("Pertanyaan tidak boleh kosong!");
        return;
      }

      // Validate at least one correct answer
      const hasCorrectAnswer = newQuestion.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error("Pilih setidaknya satu jawaban yang benar!");
        return;
      }

      // Validate option texts
      const hasEmptyOption = newQuestion.options.some(option => !option.text.trim() && !option.imageUrl);
      if (hasEmptyOption) {
        toast.error("Semua jawaban harus memiliki teks atau gambar!");
        return;
      }

      // Create question payload
      const questionPayload = {
        quizId: params.id as string,
        order: questions.length + 1,
        text: newQuestion.text,
        type: newQuestion.type,
        timeLimit: newQuestion.timeLimit,
        voiceUrl: "", // TODO: Implement voice recording
        imageUrl: newQuestion.imageUrl,
        musicFile: buatSoalMusicUrl || "",
        options: newQuestion.options.map((option, index) => ({
          text: option.text,
          points: option.points,
          isCorrect: option.isCorrect,
          order: index + 1
        }))
      };

      console.log("Question Payload:", questionPayload);
      
      // TODO: Call API to create question
      // For now, just add to local state
      const tempQuestion: Question = {
        id: Date.now().toString(),
        text: newQuestion.text,
        type: newQuestion.type,
        answers: newQuestion.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect,
          points: option.points
        })),
        correctAnswer: newQuestion.options.find(opt => opt.isCorrect)?.text || "",
        order: questions.length + 1,
        timeLimit: newQuestion.timeLimit,
        imageUrl: newQuestion.imageUrl
      };

      setQuestions([...questions, tempQuestion]);
      
      // Reset form
      setNewQuestion({
        text: "",
        type: "TRUE_FALSE",
        timeLimit: 30,
        imageUrl: "",
        musicFile: "",
        options: [
          { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
          { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
        ]
      });
      setQuestionImageUrl("");
      setBuatSoalMusicUrl("");

      toast.success("Soal berhasil dibuat!");
      
      // Switch back to edit mode
      setCurrentMode('edit');
      
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Gagal membuat soal. Silakan coba lagi.");
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e9]">
        <div className="flex flex-col items-center gap-2">
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
        <img
          src="/images/bg-main.webp"
          alt="Background"
          className="w-full h-full object-cover"
        />``
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

          <div className="flex flex-col lg:flex-row gap-2 md:gap-6 -mb-5 flex-1 min-h-0">
            {/* Main Card Form */}
            <div
              className="flex-1 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col min-h-0"
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-2 flex flex-col p-4 md:p-6">
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 md:gap-2">
                      <img src="/images/icon-title-l.svg" alt="icon" width={32} height={32} className="animate-bounce" />
                      <div className="text-2xl md:text-3xl text-amber-950 tracking-tight">
                        EDIT KUIS
                      </div>
                      <img src="/images/icon-title-r.svg" alt="icon" width={32} height={32} className="animate-bounce" />
                    </div>
                  </div>

                  {/* Form Content Scroll Area */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 space-y-2">
                    {/* Theme Selection Section */}
                    <div className="space-y-4">
                      <h2 className="text-xl md:text-2xl font-bold text-[#5d4037]">Pilih Tema Kuis</h2>
                      <div className="flex gap-6">
                        {/* Theme List */}
                        <div className="overflow-x-auto pb-4 flex-1">
                          <div className="flex gap-2 min-w-max p-1 px-2">
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
                                      className="w-full h-full object-cover rounded-xl"
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
                          className={`aspect-video rounded-xl border-2 border-dashed border-[#C9750A] bg-[#efebe9]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#efebe9] transition-colors gap-2 group w-48 flex-shrink-0 ${
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
                          {coverImageValue && selectedTheme === "custom" && coverImageValue?.trim() !== "" ? (
                            <div className="relative w-full h-full">
                              <img
                                src={coverImageValue || ""}
                                alt="Custom Cover"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <span className="text-white font-bold text-[10px] bg-black/40 px-2 py-1 rounded">
                                  Terganti
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-[#C9750A] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
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
                                  className="bg-white/80 border-[#C9750A] border-2 h-12 rounded-xl focus:border-[#C9750A] text-#C9750A"
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
                                    className="bg-white/80 border-[#C9750A] border-2 h-12 rounded-xl pr-12 focus:border-[#C9750A] text-#C9750A"
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
                                  className="absolute right-0 top-0 h-full w-12 bg-#C9750A rounded-r-xl flex items-center justify-center text-white cursor-pointer hover:bg-[#795548] transition-colors"
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
                                className="bg-white/80 border-[#C9750A] border-2 min-h-[150px] rounded-2xl focus:border-[#C9750A] text-#C9750A resize-none p-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-2 gap-2">
                      <Button
                        type="submit"
                        disabled={isActionLoading}
                        className="bg-[#C9750A] hover:bg-[#5d4037] text-white px-6 py-4 rounded-xl text-lg font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-70"
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
                        className="bg-amber-600 cursor-pointer hover:bg-amber-700 text-white px-6 py-4 rounded-xl text-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
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
                  <div className="col-span-2 space-y-3  p-4 md:p-6 max-h-screen overflow-y-auto pr-2 border-r-2 border-[#C9750A]">
                    <div className="space-y-2">
                      {questions.map((question, index) => (
                        <div 
                          key={index} 
                          className="bg-tranparent relative rounded-lg p-3 border border-[#C9750A] min-h-24 flex items-center w-full justify-center"
                          style={question.imageUrl ? {
                            backgroundImage: `url(${question.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          } : {}}
                        >
                          {!question.imageUrl && (
                            <img src="/file.svg" alt="Question" width={25} height={25}/>
                          )}
                          <button
                            onClick={() => handleEditQuestion(question.id)}
                            className="rounded-sm cursor-pointer bg-blue-500/20 absolute right-9 top-2 transition-opacity text-blue-500 hover:text-blue-700 p-1"
                            title="Edit Soal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="rounded-sm cursor-pointer bg-red-500/20 absolute right-2 top-2 transition-opacity text-red-500 hover:text-red-700 p-1"
                            title="Hapus Soal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {questions.length === 0 && (
                        <div className="text-center text-gray-500 py-10 border-2 border-[#C9750A] rounded-xl">
                          <p>Belum ada soal</p>
                        </div>
                      )}
                    </div>
                    <button className="w-full text-xs flex gap-2 items-center justify-center cursor-pointer bg-[#C9750A] hover:bg-[#C9750A] text-white rounded-sm p-2 font-bold transition-colors">
                      <Plus size={16}/> Tambah Soal
                    </button>
                  </div>

                  {/* Section 2 - Question Input & Image Upload */}
                  <div className="col-span-7 space-y-3  py-6 p-2 max-h-screen overflow-y-auto pr-2">
                    {/* Question Text Input */}
                    <div>
                      <label className="block text-[#5d4037] font-bold mb-2">Pertanyaan</label>
                      <input 
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                        className="w-full border-[#C9750A] border-2 rounded-md h-10 px-3 py-2 text-#C9750A" 
                        placeholder="Tulis soal anda"
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-80">
                        <input
                          type="file"
                          ref={questionImageInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "questionImage")}
                        />
                        {/* image yang d uupload  */}
                        {questionImageUrl ? (
                          <div className="mb-4">
                            <div 
                              className="cursor-pointer relative w-full h-52 border-2 border-[#C9750A] rounded-lg overflow-hidden"
                              onClick={() => questionImageInputRef.current?.click()}
                            >
                              <img 
                                src={questionImageUrl} 
                                alt="Uploaded image" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ):
                          <button
                            type="button"
                            onClick={() => questionImageInputRef.current?.click()}
                            className="w-full border-[#C9750A] border-2 border-dashed rounded-lg p-4 bg-white/80 hover:bg-white transition-colors cursor-pointer h-36"
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <svg className="w-8 h-8 text-[#C9750A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {questionImageUploading ? "Uploading..." : "Klik untuk upload gambar soal"}
                              </span>
                            </div>
                          </button>
                        }
                      </div>
                      
                      {/* Options */}
                      <div className="w-full">
                        <div className="flex justify-between w-full items-center mb-2">
                          <label className="block text-[#5d4037] font-bold">Jawaban</label>
                          <span className="text-xs text-gray-600">Checklist satu jawaban yang benar</span>
                        </div>
                        <div className="space-y-3 grid grid-cols-2 gap-4">
                          {newQuestion.options.map((option, index: number) => (
                            <div key={index} className="col-span-1 border-2 border-[#C9750A] rounded-lg p-3 bg-white">
                              <div className="flex items-start gap-3">
                                {/* Correct Answer Checkbox */}
                                <div className="flex items-center mt-1">
                                  <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) => {
                                      const updatedOptions = newQuestion.options.map((opt, i) => 
                                        i === index ? {...opt, isCorrect: e.target.checked} : opt
                                      );
                                      setNewQuestion({...newQuestion, options: updatedOptions});
                                    }}
                                    className="w-4 h-4 text-[#C9750A] border-[#C9750A] rounded focus:ring-[#C9750A]"
                                  />
                                </div>
                                
                                {/* Option Content */}
                                <div className="flex-1">
                                  {option.imageUrl ? (
                                    // Display uploaded image
                                    <div className="w-full h-20 border-2 border-[#C9750A] rounded-lg overflow-hidden mb-2">
                                      <img 
                                        src={option.imageUrl} 
                                        alt={`Option ${index + 1}`} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    // Text input for option
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => {
                                        const updatedOptions = newQuestion.options.map((opt, i: number) => 
                                          i === index ? {...opt, text: e.target.value} : opt
                                        );
                                        setNewQuestion({...newQuestion, options: updatedOptions});
                                      }}
                                      className="w-full border-[#C9750A] border-2 rounded-md h-10 px-3 text-#C9750A mb-2"
                                      placeholder={`Jawaban ${index + 1}`}
                                    />
                                  )}
                                  
                                  {/* Image Upload Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // TODO: Implement option image upload
                                      console.log(`Upload image for option ${index + 1}`);
                                    }}
                                    className="text-xs text-[#C9750A] hover:text-[#5d4037] mb-2"
                                  >
                                    {option.imageUrl ? "Ganti Gambar" : "Upload Gambar"}
                                  </button>
                                </div>
                                
                                {/* Points Input */}
                                <div className="flex flex-col items-end">
                                  <label className="text-xs text-gray-600 mb-1">Points</label>
                                  <input
                                    type="number"
                                    value={option.points}
                                    onChange={(e) => {
                                      const updatedOptions = newQuestion.options.map((opt, i: number) => 
                                        i === index ? {...opt, points: parseInt(e.target.value) || 0} : opt
                                      );
                                      setNewQuestion({...newQuestion, options: updatedOptions});
                                    }}
                                    className="w-16 h-8 border-[#C9750A] border-2 rounded px-2 text-center text-#C9750A text-sm"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add Option Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newOption = {
                              text: "",
                              points: 0,
                              isCorrect: false,
                              order: newQuestion.options.length + 1,
                              imageUrl: ""
                            };
                            setNewQuestion({
                              ...newQuestion,
                              options: [...newQuestion.options, newOption]
                            });
                          }}
                          className="w-full mt-3 border-2 border-dashed border-[#C9750A] rounded-lg p-3 text-[#C9750A] hover:bg-[#C9750A] hover:text-white transition-colors"
                        >
                          + Tambah Jawaban
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3 - Settings & Answer Cards */}
                  <div className="col-span-3 space-y-3 p-4 md:p-6 max-h-screen overflow-y-auto pl-2 border-l border-[#C9750A]">
                    {/* Settings Section */}
                    <div className="border-2 border-[#C9750A] rounded-2xl p-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-#C9750A font-bold mb-2">Tipe soal</label>
                          <select 
                            value={newQuestion.type}
                            onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE"})}
                            className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 text-[#C9750A]"
                          >
                            <option value="TRUE_FALSE">Benar atau Salah</option>
                            <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                            <option value="ESSAY">Essay</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#5d4037] font-bold mb-2">Waktu</label>
                          <select 
                            value={newQuestion.timeLimit}
                            onChange={(e) => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                            className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 text-[#C9750A]"
                          >
                            <option value={10}>10 Detik</option>
                            <option value={20}>20 Detik</option>
                            <option value={30}>30 Detik</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#5d4037] font-bold mb-2">Musik</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value="Default by Tema"
                              readOnly
                              className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 pr-10 text-[#C9750A]"
                            />
                            <input
                              type="file"
                              ref={buatSoalMusicFileInputRef}
                              className="hidden"
                              accept="audio/*"
                              onChange={(e) => handleFileUpload(e, "music")}
                            />
                            <button 
                              onClick={() => buatSoalMusicFileInputRef.current?.click()}
                              className="absolute right-2 top-2 text-[#C9750A] hover:text-[#5d4037]"
                            >
                              {isUploading ? (
                                <div className="w-5 h-5 border-2 border-[#C9750A] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2">
                      <button 
                        className="w-full text-xs flex gap-2 items-center justify-center cursor-pointer bg-[#C9750A] hover:bg-[#C9750A] text-white rounded-sm p-2 font-bold transition-colors"
                        onClick={() => {
                          onsubmitSoal();
                        }}
                      >
                        Simpan Soal
                      </button>
                      <button 
                        className="w-full text-xs flex gap-2 items-center justify-center cursor-pointer hover:bg-[#C9750A] border border-[#C9750A] text-[#C9750A] hover:text-white rounded-sm p-2 font-bold transition-colors"
                        type="button"
                        onClick={() => {
                          setCurrentMode('edit');
                        }}
                      >
                        Batal
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
