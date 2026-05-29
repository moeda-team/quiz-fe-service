"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { useSocket } from "@/contexts/SocketContext";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface WaitingRoomData {
  roomId: string;
  roomCode: string;
  players: Player[];
  status: 'waiting' | 'starting' | 'started';
}


export default function CodePage() {
  const { socket } = useSocket();
  const [roomData, setRoomData] = useState<WaitingRoomData | null>(null);

  const [playerStyles, setPlayerStyles] = useState<Array<{
    id: string;
    name: string;
    avatar?: string;
    left: number;
    top: number;
    duration: number;
    delay: number;
    scale: number;
    zIndex: number;
  }>>([]);

  const [particleStyles, setParticleStyles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);


  // Generate grid-based positions with random offset to avoid overlap
  useEffect(() => {
    if (!roomData?.players) {
      const t = setTimeout(() => setPlayerStyles([]), 0);
      return () => clearTimeout(t);
    }

    const cols = Math.min(5, Math.ceil(Math.sqrt(roomData.players.length * 1.5)));
    const rows = Math.ceil(roomData.players.length / cols);
    const cellW = 90 / cols;
    const cellH = 80 / rows;

    const shuffled = [...Array(roomData.players.length).keys()].sort(() => Math.random() - 0.5);

    const styles = roomData.players.map((player, i) => {
      const slot = shuffled[i];
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      return {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        left: col * cellW + 5 + Math.random() * (cellW - 12),
        top: row * cellH + 5 + Math.random() * (cellH - 18),
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
        scale: 0.85 + Math.random() * 0.3,
        zIndex: roomData.players.length - i,
      };
    });

    const t = setTimeout(() => setPlayerStyles(styles), 0);
    return () => clearTimeout(t);
  }, [roomData?.players]);

  // Generate particle styles once on mount
  useEffect(() => {
    const styles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
    setTimeout(() => setParticleStyles(styles), 0);
  }, []);

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    if (!socket) return;

    const joinCode = getCookie("quiz_joincode");

    if (!joinCode) return;

    // Emit get waiting room
    socket.emit("participant:get_waiting_room", {
      joinCode,
    });

    // Listen update waiting room
    const handleWaitingRoomUpdated = (data: {
      sessionId?: string;
      joinCode?: string;
      participants: Array<{ id: string; name: string; avatar?: string }>;
    }) => {
      
      // Update room data with new participants
      if (data.participants) {
        setRoomData(prev => {
          if (!prev) {
            // If no roomData exists, create it with the received data
            const newRoomData: WaitingRoomData = {
              roomId: data.sessionId || '',
              roomCode: data.joinCode || '',
              status: 'waiting',
              players: data.participants.map((p) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar || undefined
              }))
            };
            console.log('📡 ROOM DATA CREATED WITH PARTICIPANTS:', newRoomData);
            return newRoomData;
          }

          const updated = {
            ...prev,
            roomCode: data.joinCode || prev.roomCode,
            players: data.participants.map((p) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar || undefined
            }))
          };
          console.log('📡 ROOM DATA UPDATED WITH PARTICIPANTS:', updated);
          console.log('📡 Total participants now:', updated.players.length);
          return updated;
        });
      }
    };

    socket.on("waiting_room:updated", handleWaitingRoomUpdated);

    return () => {
      socket.off("waiting_room:updated", handleWaitingRoomUpdated);
    };
  }, [socket]);

  return (
    <main className="mx-auto">
      <div
        className="mx-auto flex h-screen w-full max-w-md flex-col gap-4 bg-white px-5 shadow-sm"
        style={{
          backgroundImage: "url(/bg-mobile.svg)",
          backgroundSize: "cover",
          backgroundPosition: "top",
          fontFamily: "Varela Round",
        }}
      >
        <div className="flex items-center justify-center">
          <Image
            src="/logo-mobile.svg"
            alt="Logo"
            width={200}
            height={200}
          />
        </div>

        <GlobalMusicPlayer />

        <div className="flex h-[80vh] w-full flex-col items-center justify-start rounded-2xl py-16">
          {/* Players Area */}
          <div className="relative w-full flex-1 min-h-[360px] md:min-h-[420px]">
            {playerStyles.map((player) => (
              <div
                key={player.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${player.left}%`,
                  top: `${player.top}%`,
                  animation: `float ${player.duration}s ease-in-out ${player.delay}s infinite alternate`,
                  zIndex: player.zIndex,
                }}
              >
                  {/* Cloud Platform */}
                  <div className="relative mb-1">
                    {/* Avatar Character */}
                    <div className="relative w-38 h-38 flex items-center justify-center z-10">
                      <Image src={player.avatar || "/character/char-1.svg"} alt={player.name} width={80} height={80} className="w-full h-full object-contain drop-shadow-lg" />
                      <span className="absolute text-xs font-bold bottom-8 left-1/2 transform -translate-x-1/2 z-10 text-amber-700" style={{ fontFamily: 'Varela Round, serif' }}>
                        {player.name.length > 10 ? player.name.substring(0,10) + '...' : player.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
  
          <style>{`
            @keyframes float {
              0% { transform: translate(0, 0); }
              25% { transform: translate(10px, -14px); }
              50% { transform: translate(-6px, 6px); }
              75% { transform: translate(14px, 10px); }
              100% { transform: translate(-10px, -4px); }
            }
          `}</style>
          
          {/* Animated particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particleStyles.map((style, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"
                style={style}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}