"use client";

import { toast } from "sonner";
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
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
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import {
  QuestionOption,
  EssayAnswer,
  PuzzleItem,
  BaseQuestionPayload,
  TrueFalsePayload,
  MultipleChoicePayload,
  EssayPayload,
  PuzzlePayload,
  QuestionPayload
} from "@/types/quiz";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

// Validation function for question payload based on type
const validateQuestionPayload = (payload: QuestionPayload, type: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Common validations
  if (!payload.quizId) errors.push("Quiz ID harus ada");
  if (!payload.text?.trim()) errors.push("Pertanyaan tidak boleh kosong");
  if (!payload.type) errors.push("Tipe soal harus ada");
  if (!payload.timeLimit || payload.timeLimit <= 0) errors.push("Waktu harus lebih dari 0 detik");

  // Type-specific validations
  switch (type) {
    case "TRUE_FALSE": {
      const tfPayload = payload as TrueFalsePayload;
      if (!Array.isArray(tfPayload.options) || tfPayload.options.length !== 2) {
        errors.push("Soal TRUE_FALSE harus memiliki tepat 2 pilihan");
      } else {
        const hasCorrect = tfPayload.options.some((opt: QuestionOption) => opt.isCorrect === true);
        if (!hasCorrect) errors.push("Harus ada satu jawaban yang benar");
        tfPayload.options.forEach((opt: QuestionOption, idx: number) => {
          if (!opt.text?.trim() && !opt.imageUrl?.trim()) {
            errors.push(`Opsi ${idx + 1} harus memiliki teks atau gambar`);
          }
          if (typeof opt.points !== "number" || opt.points < 0) {
            errors.push(`Opsi ${idx + 1} harus memiliki poin yang valid`);
          }
          if (typeof opt.isCorrect !== "boolean") {
            errors.push(`Opsi ${idx + 1} harus menentukan status benar/salah`);
          }
          if (typeof opt.order !== "number" || opt.order < 1) {
            errors.push(`Opsi ${idx + 1} harus memiliki urutan yang valid`);
          }
        });
      }
      break;
    }

    case "MULTIPLE_CHOICE": {
      const mcPayload = payload as MultipleChoicePayload;
      if (!Array.isArray(mcPayload.options) || mcPayload.options.length < 2) {
        errors.push("Soal MULTIPLE_CHOICE harus memiliki minimal 2 pilihan");
      } else {
        const hasCorrect = mcPayload.options.some((opt: QuestionOption) => opt.isCorrect === true);
        if (!hasCorrect) errors.push("Harus ada satu jawaban yang benar");
        
        mcPayload.options.forEach((opt: QuestionOption, idx: number) => {
          if (!opt.text?.trim() && !opt.imageUrl?.trim()) {
            errors.push(`Opsi ${idx + 1} harus memiliki teks atau gambar`);
          }
          if (typeof opt.points !== "number" || opt.points < 0) {
            errors.push(`Opsi ${idx + 1} harus memiliki poin yang valid`);
          }
          if (typeof opt.isCorrect !== "boolean") {
            errors.push(`Opsi ${idx + 1} harus menentukan status benar/salah`);
          }
          if (typeof opt.order !== "number" || opt.order < 1) {
            errors.push(`Opsi ${idx + 1} harus memiliki urutan yang valid`);
          }
        });
      }
      break;
    }

    case "ESSAY": {
      const essayPayload = payload as EssayPayload;
      // if (!essayPayload.essayAnswer) {
      //   errors.push("Soal ESSAY harus memiliki expectedAnswer");
      // } else {
      //   if (!essayPayload.essayAnswer.expectedAnswer?.trim()) {
      //     errors.push("Jawaban yang diharapkan tidak boleh kosong");
      //   }
      // }
      break;
    }

    case "PUZZLE": {
      const puzzlePayload = payload as PuzzlePayload;
      if (!Array.isArray(puzzlePayload.puzzleItems) || puzzlePayload.puzzleItems.length < 2) {
        errors.push("Soal PUZZLE harus memiliki minimal 2 item");
      } else {
        puzzlePayload.puzzleItems.forEach((item: PuzzleItem, idx: number) => {
          if (!item.text?.trim()) {
            errors.push(`Item puzzle ${idx + 1} tidak boleh kosong`);
          }
          if (typeof item.correctOrder !== "number" || item.correctOrder < 1) {
            errors.push(`Item puzzle ${idx + 1} harus memiliki urutan yang valid`);
          }
        });
      }
      break;
    }

    default:
      errors.push(`Tipe soal "${type}" tidak valid`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};


export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuizById, updateQuiz, isLoading: isActionLoading } = useQuizzes();
  const { deleteQuestion, createQuestion, updateQuestion, isLoading: isQuestionsLoading } = useQuestions();
  const { uploadFile, isUploading } = useFileUpload();
  const { themes, isLoading: isThemesLoading, addTheme, refreshThemes } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<'edit' | 'buat_soal'>('edit');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionImageUploading, setQuestionImageUploading] = useState(false);
  const [questionImageUrl, setQuestionImageUrl] = useState("");
    
  // State untuk option images
  const [optionImageUploading, setOptionImageUploading] = useState<{ [key: number]: boolean }>({});
  const [optionImages, setOptionImages] = useState<{ [key: number]: string }>({});
  
  // State untuk tracking mode edit soal
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // State for drag-and-drop reorder (PUZZLE)
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const updatedOptions = [...newQuestion.options];
    const [movedItem] = updatedOptions.splice(dragIndex, 1);
    updatedOptions.splice(index, 0, movedItem);
    // Update order values to match new positions
    const reorderedOptions = updatedOptions.map((opt, i) => ({ ...opt, order: i + 1 }));
    setNewQuestion({ ...newQuestion, options: reorderedOptions });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };
  
  // Global music player
  const { setQuizMusic, togglePlayPause, pauseMusic, isPlaying, currentMusicUrl } = useMusicPlayer();
  
  // Question creation form state
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    type: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE";
    timeLimit: number;
    options: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
      points: number | null;
      imageUrl?: string;
    }>;
    order: number;
    musicFile?: string;
    imageUrl?: string;
  }>({
    text: "",
    type: "MULTIPLE_CHOICE",
    timeLimit: 30,
    order: 1,
    imageUrl: "",
    musicFile: "",
    options: [
      { text: "", points: null, isCorrect: true, order: 1, imageUrl: "" },
      { text: "", points: null, isCorrect: false, order: 2, imageUrl: "" }
    ]
  });

  // Effect to set default options based on question type
  useEffect(() => {
    const getDefaultOptions = (type: string) => {
      switch (type) {
        case "TRUE_FALSE":
          return [
            { text: "", points: null, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: null, isCorrect: false, order: 2, imageUrl: "" }
          ];
        case "ESSAY":
          return [
            { text: "", points: null, isCorrect: true, order: 1, imageUrl: "" }
          ];
        case "PUZZLE":
          return [
            { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: 10, isCorrect: true, order: 2, imageUrl: "" }
          ];
        case "MULTIPLE_CHOICE":
          return [
            { text: "", points: null, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: null, isCorrect: false, order: 2, imageUrl: "" }
          ];
        default:
          return [
            { text: "", points: null, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: null, isCorrect: false, order: 2, imageUrl: "" }
          ];
      }
    };

    // Only reset options when question type changes AND not in edit mode
    if (!editingQuestionId) {
      const defaultOptions = getDefaultOptions(newQuestion.type);
      // Use setTimeout to defer state update and avoid cascading renders
      setTimeout(() => {
        setNewQuestion(prev => ({
          ...prev,
          options: defaultOptions
        }));
      }, 0);
    }
  }, [newQuestion.type, editingQuestionId]);

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
        if (!response) return;
        
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

  // Stop music when switching to 'buat_soal' mode (but allow manual play)
  useEffect(() => {
    if (currentMode === 'buat_soal' && !isPlaying) {
      pauseMusic();
    }
  }, [currentMode, pauseMusic, isPlaying]);

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
          // Also update newQuestion.imageUrl
          setNewQuestion(prev => ({
            ...prev,
            imageUrl: response.data.fileUrl
          }));
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
            toast.success("Musik quiz berhasil diupload!");
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

  const handleQuestionMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload music for question with context "question"
      const response = await uploadFile(file, "music", "question");
      if (response) {
        toast.success("Musik soal berhasil diupload!");
        // Update newQuestion.musicFile
        setNewQuestion(prev => ({
          ...prev,
          musicFile: response.data.fileUrl
        }));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Gagal upload musik soal: " + errorMessage);
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

  const handlePlayQuestionMusic = () => {
    const musicUrl = newQuestion.musicFile || "/media/default.mp3";
    setQuizMusic(musicUrl);
    
    // Force play after setting the music
    setTimeout(() => {
      togglePlayPause();
    }, 100);
  };

  const handleAddNewQuestion = () => {
    setNewQuestion({
      text: "",
      type: "MULTIPLE_CHOICE",
      timeLimit: 30,
      order: questions.length + 1,
      options: [
        { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
        { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
      ],
      imageUrl: "",
      musicFile: ""
    });
    setQuestionImageUrl("");
    setOptionImages({});
    setOptionImageUploading({});
    setEditingQuestionId(null);
    setCurrentMode('buat_soal');
    toast.success("Form direset untuk soal baru!");
  };

  // Fungsi khusus untuk upload option image
  const handleOptionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    optionIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setOptionImageUploading(prev => ({ ...prev, [optionIndex]: true }));
      
      const response = await uploadFile(file, "image", "question");
      if (response) {
        toast.success(`Gambar opsi ${optionIndex + 1} berhasil diupload!`);
        
        // Update option image URL
        setOptionImages(prev => ({ ...prev, [optionIndex]: response.data.fileUrl }));
        
        // Update newQuestion options dengan imageUrl
        setNewQuestion(prev => ({
          ...prev,
          options: prev.options.map((option, index) => 
            index === optionIndex 
              ? { ...option, imageUrl: response.data.fileUrl }
              : option
          )
        }));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Gagal upload gambar opsi ${optionIndex + 1}: ` + errorMessage);
    } finally {
      setOptionImageUploading(prev => ({ ...prev, [optionIndex]: false }));
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

  const handleEditQuestion = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    pauseMusic();

    // Find the question by ID
    const questionToEdit = questions.find(q => q.id === id);
    if (questionToEdit) {
      
      // Map question data to newQuestion state
      let mappedOptions;
      if (questionToEdit.options && questionToEdit.options.length > 0) {
        mappedOptions = questionToEdit.options.map((option, index) => ({
          text: option.text,
          points: option.points,
          isCorrect: option.isCorrect,
          order: option.order || index + 1,
          imageUrl: option.imageUrl || ""
        }));
      } else if (questionToEdit.answers && questionToEdit.answers.length > 0) {
        mappedOptions = questionToEdit.answers.map((answer, index) => ({
          text: answer.text,
          points: answer.points || 0,
          isCorrect: answer.isCorrect,
          order: index + 1,
          imageUrl: ""
        }));
      } else {
        // Use default options based on question type
        const defaultOptions = {
          "TRUE_FALSE": [
            { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
          ],
          "ESSAY": [
            { text: "", points: 100, isCorrect: true, order: 1, imageUrl: "" }
          ],
          "PUZZLE": [
            { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: 10, isCorrect: true, order: 2, imageUrl: "" }
          ],
          "MULTIPLE_CHOICE": [
            { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
            { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
          ]
        };
        mappedOptions = defaultOptions[questionToEdit.type as keyof typeof defaultOptions] || defaultOptions.MULTIPLE_CHOICE;
      }

      // Update state synchronously using flushSync
      flushSync(() => {
        setNewQuestion({
          text: questionToEdit.text || "",
          type: questionToEdit.type || "MULTIPLE_CHOICE",
          timeLimit: questionToEdit.timeLimit || 30,
          order: questionToEdit.order || questions.length + 1,
          imageUrl: questionToEdit.imageUrl || "",
          musicFile: questionToEdit.musicFile || "",
          options: mappedOptions
        });

        // Set question image URL if exists
        if (questionToEdit.imageUrl) {
          setQuestionImageUrl(questionToEdit.imageUrl);
        }

        // Switch to edit mode and set editing ID
        setCurrentMode('buat_soal');
        setEditingQuestionId(id);
      });
      
      toast.success("Soal dimuat untuk diedit!");
    } else {
      toast.error("Soal tidak ditemukan!");
    }
  };

  const handleResetForm = () => {
    setNewQuestion({
      text: "",
      type: "TRUE_FALSE",
      timeLimit: 30,
      order: questions.length + 1,
      imageUrl: "",
      musicFile: "",
      options: [
        { text: "", points: 10, isCorrect: true, order: 1, imageUrl: "" },
        { text: "", points: 0, isCorrect: false, order: 2, imageUrl: "" }
      ]
    });
    setQuestionImageUrl("");
    setOptionImages({});
    setOptionImageUploading({});
    setEditingQuestionId(null);
  };

  const onsubmitSoal = async () => {
    // Stop music when saving question
    pauseMusic();
    
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

      // Validate option texts (skip for ESSAY type)
      if (newQuestion.type !== "ESSAY") {
        const hasEmptyOption = newQuestion.options.some(option => !option.text.trim() && !option.imageUrl);
        if (hasEmptyOption) {
          toast.error("Semua jawaban harus memiliki teks atau gambar!");
          return;
        }
      }

      // Build type-specific payload
      let questionPayload: QuestionPayload;
      const basePayload: BaseQuestionPayload = {
        quizId: params.id as string,
        order: newQuestion.order || questions.length + 1,
        text: newQuestion.text,
        type: newQuestion.type,
        timeLimit: newQuestion.timeLimit,
        voiceUrl: "/media/default.mp3",
        imageUrl: newQuestion.imageUrl || "",
        musicFile: newQuestion.musicFile || "/media/default.mp3",
      };

      // Add type-specific fields
      switch (newQuestion.type) {
        case "TRUE_FALSE": {
          const options: QuestionOption[] = newQuestion.options.map((option, index) => ({
            text: option.text,
            points: option.points ?? 0,
            isCorrect: option.isCorrect,
            order: index + 1,
            imageUrl: option.imageUrl || ""
          }));
          questionPayload = {
            ...basePayload,
            type: "TRUE_FALSE",
            options
          } as TrueFalsePayload;
          break;
        }

        case "MULTIPLE_CHOICE": {
          const options: QuestionOption[] = newQuestion.options.map((option, index) => ({
            text: option.text,
            points: option.points ?? 0,
            isCorrect: option.isCorrect,
            order: index + 1,
            imageUrl: option.imageUrl || ""
          }));
          questionPayload = {
            ...basePayload,
            type: "MULTIPLE_CHOICE",
            options
          } as MultipleChoicePayload;
          break;
        }

        case "ESSAY": {
          const essayCorrectOption = newQuestion.options.find(opt => opt.isCorrect);
          const essayAnswer: EssayAnswer = {
            expectedAnswer: essayCorrectOption?.text || ""
          };
          const options: QuestionOption[] = newQuestion.options.map((option, index) => ({
            text: option.text,
            points: option.points ?? 0,
            isCorrect: option.isCorrect,
            order: index + 1
          }));
          questionPayload = {
            ...basePayload,
            type: "ESSAY",
            essayAnswer,
            options
          } as EssayPayload;
          break;
        }

        case "PUZZLE": {
          const puzzleItems: PuzzleItem[] = newQuestion.options.map((option, index) => ({
            text: option.text,
            correctOrder: index + 1,
            points: option.points ?? 10
          }));
          questionPayload = {
            ...basePayload,
            type: "PUZZLE",
            puzzleItems
          } as PuzzlePayload;
          break;
        }

        default:
          toast.error("Tipe soal tidak valid");
          return;
      }

      // Validate the payload based on type
      const validation = validateQuestionPayload(questionPayload, newQuestion.type);
      if (!validation.valid) {
        const errorMessage = validation.errors.join("\n");
        toast.error(`Validasi gagal:\n${errorMessage}`);
        return;
      }
      
      if (editingQuestionId) {
        // Update existing question
        try {
          // Call API to update question
          const response = await updateQuestion(params.id as string, editingQuestionId, questionPayload);
          
          const updatedQuestion: Question = {
            id: editingQuestionId,
            text: newQuestion.text,
            type: newQuestion.type,
            answers: newQuestion.options.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect,
              points: option.points ?? 0
            })),
            correctAnswer: newQuestion.options.find(opt => opt.isCorrect)?.text || "",
            order: questions.find(q => q.id === editingQuestionId)?.order || questions.length + 1,
            timeLimit: newQuestion.timeLimit,
            imageUrl: newQuestion.imageUrl
          };

          // Update question in the list
          setQuestions(questions.map(q => q.id === editingQuestionId ? updatedQuestion : q));
          
          toast.success("Soal berhasil diperbarui!");
        } catch (error) {
          console.error("Error updating question:", error);
          toast.error("Gagal memperbarui soal. Silakan coba lagi.");
          return;
        }
      } else {
        // Create new question
        try {
          // Call API to create question
          const response = await createQuestion(params.id as string, questionPayload);
          
          const tempQuestion: Question = {
            id: (response as ApiResponse<Question>)?.data?.id || Date.now().toString(),
            text: newQuestion.text,
            type: newQuestion.type,
            answers: newQuestion.options.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect,
              points: option.points ?? 0
            })),
            correctAnswer: newQuestion.options.find(opt => opt.isCorrect)?.text || "",
            order: questions.length + 1,
            timeLimit: newQuestion.timeLimit,
            imageUrl: newQuestion.imageUrl
          };

          setQuestions([...questions, tempQuestion]);
          
          toast.success("Soal berhasil dibuat!");
        } catch (error) {
          console.error("Error creating question:", error);
          toast.error("Gagal membuat soal. Silakan coba lagi.");
          return;
        }
      }

      handleResetForm();
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Gagal membuat soal. Silakan coba lagi.");
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e9]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="text-black font-bold">Memuat data kuis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen relative overflow-y-auto lg:overflow-hidden flex flex-col">
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
              className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-black drop-shadow-xl tracking-wider text-shadow-lg text-shadow-amber-400 uppercase"
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
              className="flex-1 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col min-h-0 max-h-full"
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-2 flex flex-col min-h-0 p-6">
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 shrink-0">
                    <div className="flex items-center justify-center gap-2 md:gap-4">
                      <img src="/images/icon-title-l.svg" alt="icon" width={32} height={32} className="animate-bounce" />
                      <div className="text-2xl md:text-3xl text-black tracking-tight">
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
                      <div className="gap-6 grid grid-cols-4">
                        {/* Theme List */}
                        <div className="overflow-x-auto flex-1 col-span-4 lg:col-span-3 xs:col-span-2 md:col-span-2">
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
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                  className="absolute border-l right-12 top-0 h-full w-12 bg-#C9750A flex items-center justify-center text-white cursor-pointer transition-colors"
                                >
                                  {isUploading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Upload size={20} color="#5d4037" />
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
                          pauseMusic();
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
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 overflow-auto p-2 md:p-0">
                  {/* Section 1 - Questions List */}
                  <div className="col-span-12 lg:col-span-2 p-2 md:p-4 lg:p-6 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto lg:pr-2 lg:border-r-2 lg:border-[#C9750A]">
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                      {questions.map((question, index) => (
                        <div 
                          key={index} 
                          className="bg-tranparent relative rounded-lg p-2 sm:p-3 sm:pr-6 border border-[#C9750A] min-h-20 sm:min-h-24 max-h-24 flex items-center w-20 sm:w-24 lg:w-full justify-center flex-shrink-0"
                          style={question.imageUrl ? {
                            backgroundImage: `url(${question.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          } : {}}
                        >
                          {!question.imageUrl && (
                            <img src="/empty-question.svg" alt="Question" className="h-12 sm:h-18"/>
                          )}
                          <button
                            onClick={(e) => handleEditQuestion(e, question.id)}
                            className="rounded-sm cursor-pointer bg-blue-500/20 absolute right-7 sm:right-9 top-1 sm:top-2 transition-opacity text-blue-500 hover:text-blue-700 p-0.5 sm:p-1"
                            title="Edit Soal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="rounded-sm cursor-pointer bg-red-500/20 absolute right-1 sm:right-2 top-1 sm:top-2 transition-opacity text-red-500 hover:text-red-700 p-0.5 sm:p-1"
                            title="Hapus Soal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {questions.length === 0 && (
                        <div className="text-center text-gray-500 py-4 lg:py-10 border-2 border-[#C9750A] rounded-xl min-w-[80px] flex-shrink-0">
                          <p className="text-xs lg:text-sm">Belum ada soal</p>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        handleAddNewQuestion();
                        pauseMusic();
                      }}
                      className="w-auto lg:w-full text-xs flex gap-2 mt-4 items-center justify-center cursor-pointer bg-[#C9750A] hover:bg-[#C9750A] text-white rounded-sm p-2 font-bold transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4"/> Tambah Soal
                    </button>
                  </div>

                  {/* Section 2 - Question Input & Image Upload */}
                  <div className="col-span-12 md:col-span-7 lg:col-span-7 space-y-3 p-2 md:p-4 md:py-6 md:max-h-[calc(100vh-150px)] md:overflow-y-auto md:pr-2">
                    {/* Question Text Input */}
                    <div>
                      <label className="block text-black font-bold mb-2">Pertanyaan</label>
                      <input 
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                        className="w-full border-[#C9750A] border-2 rounded-md h-10 px-3 py-2 text-black" 
                        placeholder="Tulis soal anda"
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-full max-w-xs sm:max-w-sm md:w-80">
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
                        <div className="flex justify-between w-full items-center my-2">
                          <label className="text-xs block text-gray-600 font-bold">Jawaban</label>
                          {newQuestion.type !== "PUZZLE" && (
                            <span className="text-xs text-gray-600">Checklist satu jawaban yang benar</span>
                          )}
                          {newQuestion.type === "PUZZLE" && (
                            <span className="text-xs text-gray-600">Susun urutan jawaban yang benar</span>
                          )}
                        </div>
                        <div className={`grid ${newQuestion.type === 'PUZZLE' ? 'grid-cols-1' : newQuestion.options.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4 sm:gap-6 md:gap-8`}>
                          {newQuestion.options.map((option, index: number) => (
                            <div
                              key={index}
                              className={`bg-[#784421] border rounded-lg p-2 sm:p-3 md:p-4 relative shadow-md flex flex-col ${
                                newQuestion.type === 'PUZZLE' ? 'h-36' : 'h-full'
                              } ${
                                newQuestion.type === 'PUZZLE'
                                  ? dragIndex === index
                                    ? 'opacity-50 border-yellow-400 border-2'
                                    : dragOverIndex === index
                                    ? 'border-yellow-400 border-2 scale-[1.02]'
                                    : 'border-[#784421]/10'
                                  : 'border-[#784421]/10'
                              } transition-all`}
                              draggable={newQuestion.type === 'PUZZLE'}
                              onDragStart={newQuestion.type === 'PUZZLE' ? () => handleDragStart(index) : undefined}
                              onDragOver={newQuestion.type === 'PUZZLE' ? (e) => handleDragOver(e, index) : undefined}
                              onDragLeave={newQuestion.type === 'PUZZLE' ? handleDragLeave : undefined}
                              onDrop={newQuestion.type === 'PUZZLE' ? () => handleDrop(index) : undefined}
                              onDragEnd={newQuestion.type === 'PUZZLE' ? handleDragEnd : undefined}
                            >
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
                                  setNewQuestion({...newQuestion, options: updatedOptions});
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                                title="Hapus jawaban"
                              >
                                <Trash2 size={14} />
                              </button>
                              
                              {/* Input Group */}
                              <div className="space-y-3 mt-auto">
                                {/* Baris pertama: Upload + Points + Checkbox */}
                                <div className="flex items-center gap-2 mb-2">
                                  {/* Upload Button */}
                                  <div className="w-8 h-8 shrink-0 relative">
                                    <input
                                      type="file"
                                      id={`option-image-${index}`}
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => handleOptionImageUpload(e, index)}
                                    />
                                    <img 
                                      src="/images/upload.svg" 
                                      alt="Upload" 
                                      className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity bg-amber-800" 
                                      onClick={() => document.getElementById(`option-image-${index}`)?.click()}
                                    />
                                    {optionImageUploading[index] && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Points Input */}
                                  <input
                                    type="text"
                                    value={option.points?.toString() || ''}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      const updatedOptions = newQuestion.options.map((opt, i: number) => {
                                        if (i === index) {
                                          // Jika input kosong, set ke null
                                          if (inputValue === '') {
                                            return {...opt, points: null};
                                          }
                                          // Parse input, jika tidak valid gunakan null
                                          const parsedValue = parseInt(inputValue);
                                          return {...opt, points: isNaN(parsedValue) ? null : parsedValue};
                                        }
                                        return opt;
                                      });
                                      setNewQuestion({...newQuestion, options: updatedOptions});
                                    }}
                                    className="flex-1 h-8 rounded px-2 text-center text-white text-sm flex-shrink-0"
                                    min="0"
                                    placeholder="0"
                                  />
                                  
                                  {/* Checkbox or Order Number (PUZZLE) */}
                                  {newQuestion.type === "PUZZLE" ? (
                                    <div 
                                      className="flex items-center gap-1 flex-shrink-0 cursor-move"
                                      title={`Urutan ke-${index + 1} - Seret untuk mengubah urutan`}
                                    >
                                      {/* Grip Handle Icon */}
                                      <div className="flex flex-col gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="flex gap-0.5">
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                        </div>
                                        <div className="flex gap-0.5">
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                        </div>
                                        <div className="flex gap-0.5">
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                          <span className="w-1 h-1 bg-white rounded-full"></span>
                                        </div>
                                      </div>
                                      <div className="w-8 h-8 rounded-md bg-[#C9750A] flex items-center justify-center shadow-md text-white font-bold text-sm">
                                        #{index + 1}
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-md cursor-pointer flex-shrink-0 hover:shadow-lg transition-shadow"
                                      onClick={() => {
                                        const updatedOptions = newQuestion.options.map((opt, i) => 
                                          i === index ? {...opt, isCorrect: !opt.isCorrect, points: !opt.isCorrect ? opt.points :  0 } : opt
                                        );
                                        setNewQuestion({...newQuestion, options: updatedOptions});
                                      }}
                                      title={option.isCorrect ? "Jawaban Benar" : "Jawaban Salah"}
                                    >
                                      {option.isCorrect ? (
                                        <img src="/images/checkbox-checked.svg" alt="Checked" className="w-full h-full bg-green-400 rounded-md" />
                                      ) : (
                                        <img src="/images/checkbox-unchecked.svg" alt="Unchecked" className="w-full h-full bg-amber-800 rounded-md" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className={`bg-[#6B3F2B] border border-[#6B3F2B]/30 shadow-2xl rounded-lg p-2 sm:p-3 md:p-4 flex-1 flex items-center justify-center ${newQuestion.type === 'PUZZLE' ? 'min-h-[40px]' : 'min-h-[100px] sm:min-h-[120px] md:min-h-[150px]'}`}>
                                {option.imageUrl ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <img 
                                      src={option.imageUrl} 
                                      alt={`Option ${index + 1}`} 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <textarea
                                    value={option.text}
                                    onChange={(e) => {
                                      const updatedOptions = newQuestion.options.map((opt, i: number) => 
                                        i === index ? {...opt, text: e.target.value} : opt
                                      );
                                      setNewQuestion({...newQuestion, options: updatedOptions});
                                    }}
                                    className="w-full h-full bg-transparent rounded-md px-2 sm:px-3 py-1 sm:py-2 text-white placeholder-white/70 text-xs sm:text-sm resize-none text-center"
                                    placeholder={`Tulis jawaban ${index + 1}`}
                                    style={{ minHeight: newQuestion.type === 'PUZZLE' ? '30px' : '80px' }}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add Option Button - Only for PUZZLE and MULTIPLE_CHOICE type */}
                        {(newQuestion.type === "PUZZLE" || newQuestion.type === "MULTIPLE_CHOICE") && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOption = {
                                text: "",
                                points: newQuestion.type === "PUZZLE" ? 10 : 0,
                                isCorrect: false,
                                order: newQuestion.options.length + 1,
                                imageUrl: ""
                              };
                              setNewQuestion({
                                ...newQuestion,
                                options: [...newQuestion.options, newOption]
                              });
                            }}
                            className="w-full mt-3 bg-[#8D6E63]/50 border-2 border-dashed border-[#8D6E63] rounded-lg p-4 text-white hover:bg-[#8D6E63] transition-colors shadow-md"
                          >
                            + Tambah Jawaban
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3 - Settings & Answer Cards */}
                  <div className="col-span-12 md:col-span-5 lg:col-span-3 space-y-3 p-2 md:p-4 lg:p-6 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto lg:pl-2 lg:border-l lg:border-[#C9750A]">
                    {/* Settings Section */}
                    <div className="border-2 border-[#C9750A] rounded-2xl p-2 md:p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-black font-bold mb-2">Tipe soal</label>
                          <select 
                            value={newQuestion.type}
                            onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as "TRUE_FALSE" | "MULTIPLE_CHOICE" | "ESSAY" | "PUZZLE"})}
                            className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 text-black"
                          >
                            <option value="TRUE_FALSE">Benar atau Salah</option>
                            <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                            <option value="ESSAY">Essay</option>
                            <option value="PUZZLE">Puzzle</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">Waktu</label>
                          <select 
                            value={newQuestion.timeLimit}
                            onChange={(e) => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                            className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 text-black"
                          >
                            <option value={20}>20 Detik</option>
                            <option value={30}>30 Detik</option>
                            <option value={40}>40 Detik</option>
                            <option value={50}>50 Detik</option>
                            <option value={60}>1 Menit</option>
                            <option value={120}>2 Menit</option>
                            <option value={180}>3 Menit</option>
                            <option value={240}>4 Menit</option>
                            <option value={300}>5 Menit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">Urutan Soal</label>
                          <input
                            type="number"
                            min="1"
                            value={newQuestion.order}
                            onChange={(e) => setNewQuestion({...newQuestion, order: parseInt(e.target.value) || 1})}
                            className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-black font-bold mb-2">Musik</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={newQuestion.musicFile || "Default by Tema"}
                              readOnly
                              className="w-full bg-white border-[#C9750A] border-2 h-10 rounded-lg px-3 pr-20 text-black"
                            />
                            <input
                              type="file"
                              ref={buatSoalMusicFileInputRef}
                              className="hidden"
                              accept="audio/*"
                              onChange={handleQuestionMusicUpload}
                            />
                            <button 
                              onClick={() => buatSoalMusicFileInputRef.current?.click()}
                              className="absolute border-l right-8 top-0 h-full w-8 bg-[#C9750A] flex items-center justify-center text-white cursor-pointer hover:bg-[#795548] transition-colors"
                            >
                              {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload size={16} color="#fff" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={handlePlayQuestionMusic}
                              className="absolute right-0 top-0 h-full w-8 bg-[#795548] rounded-r-lg flex items-center justify-center text-white cursor-pointer hover:bg-[#5d4037] transition-colors border-l border-white/20"
                              title="Play Question Music"
                            >
                              {isPlaying && currentMusicUrl === newQuestion.musicFile ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
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
                          handleResetForm();
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
