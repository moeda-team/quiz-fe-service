"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { useCharacters } from "@/hooks/useCharacter";
import { useSocket } from "@/contexts/SocketContext";
import { useRouter } from "next/navigation";

export default function CodePage() {
  const { characters, fetchCharacters } = useCharacters();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; joinCode?: string; character?: string }>({});
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const { socket } = useSocket();

  const router = useRouter();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        await fetchCharacters();
      } catch (error) {
        console.error("Failed to load characters:", error);
      } finally {
        setIsLoadingCharacters(false);
      }
    };
    loadCharacters();
  }, [fetchCharacters]);

  const validateForm = () => {
    const newErrors: { name?: string; joinCode?: string; character?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Nama peserta wajib diisi";
    } else if (name.length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!joinCode.trim()) {
      newErrors.joinCode = "Kode kuis wajib diisi";
    } else if (joinCode.length < 3) {
      newErrors.joinCode = "Kode kuis minimal 3 karakter";
    }

    if (!selectedCharacter) {
      newErrors.character = "Pilih character terlebih dahulu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (socket?.connected) {
        socket.emit('participant:join', { 
          joinCode: joinCode,
          name: name,
          profileCharacterId: selectedCharacter
        });

        socket.on('participant:joined_success', (data) => {
          console.log('Participant joined successfully:', data);
          setCookie(`quiz_session_${data.sessionId}`, data.sessionId, 1);
          setCookie(`quiz_participantId_${data.participantId}`, data.participantId, 1);
          setCookie(`quiz_joincode`, data.joinCode, 1);
          router.push(`/quiziz/${data.sessionId}`);
        });

      } else {
        console.error('❌ Socket not connected');
      }
    }
  };

  return (
    <main className="mx-auto">
      <div 
        className="mx-auto w-full max-w-md bg-white px-5 shadow-sm h-[calc(100vh)] flex flex-col gap-4"
        style={{
          backgroundImage: 'url(/bg-mobile.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          fontFamily: 'Varela Round',
        }}
      >
        <div className="flex items-center justify-center">
          <Image src="/logo-mobile.svg" alt="Logo" width={200} height={200} />
        </div>
        
        <GlobalMusicPlayer />
        
        <div 
          className="w-full rounded-2xl h-[calc(80vh)] flex flex-col items-center justify-start py-16"
          style={{
            backgroundImage: 'url(/card-mobile.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'top',
            fontFamily: 'Varela Round',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="flex items-center justify-center">
            <Image src="/mobile-efect.svg" alt="Logo" width={150} height={150} />
          </div>
          <div className="max-w-xs mx-auto flex items-center justify-center flex-col my-4">
           <p className="text-gray-700 text-lg font-semibold text-center">Siap Ikut Kuis?</p>
           <p className="text-gray-700 text-sm font-normal text-center max-w-[250px]">Masukkan namamu dan kode kuis untuk mulai bermain 🎉</p>
           <input
            type="text"
            className={`w-full rounded-lg border-2 px-4 py-1 mt-2 ${errors.name ? 'border-red-500' : 'border-amber-600'}`}
            placeholder="Nama Peserta"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
           <input
            type="text"
            className={`w-full rounded-lg border-2 px-4 py-1 mt-2 ${errors.joinCode ? 'border-red-500' : 'border-amber-600'}`}
            placeholder="Contoh: ABC123"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          {errors.joinCode && <p className="text-red-500 text-xs mt-1">{errors.joinCode}</p>}
           {/* select character */}
           <div className="w-full items-center justify-center my-2 gap-1">
            <div>
              <p className="text-gray-700 text-sm font-normal text-center">Pilih Character</p>
            </div>
            <div className="w-[250px] overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max py-2">
                {isLoadingCharacters ? (
                  <p className="text-gray-500 text-sm">Memuat character...</p>
                ) : characters.length === 0 ? (
                  <p className="text-gray-500 text-sm">Tidak ada character tersedia</p>
                ) : (
                  characters.map((character) => (
                    <div
                      key={character.id}
                      className={`min-w-12 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        selectedCharacter === character.id
                          ? "bg-amber-500 ring-4 ring-amber-300"
                          : "bg-gray-400"
                      }`}
                      onClick={() => setSelectedCharacter(character.id)}
                    >
                      <img
                        src={character.profileImage}
                        alt={character.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            {errors.character && <p className="text-red-500 text-xs mt-1 text-center">{errors.character}</p>}
          </div>
           <button
            className="w-44 rounded-lg bg-[#67753F] text-white px-4 py-2 mt-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!name.trim() || !joinCode.trim() || !selectedCharacter}
          >
              Mulai Kuis <ArrowRight size={16} className="inline ml-1" />
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}