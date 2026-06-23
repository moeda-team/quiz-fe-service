"use client";

import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useRef, useEffect } from 'react';

interface GlobalMusicPlayerProps {
  volume?: number;
  autoPlay?: boolean;
}

export default function GlobalMusicPlayer({ volume = 0.2, autoPlay = false }: GlobalMusicPlayerProps) {
  const {
    currentMusicUrl,
    isPlaying,
    togglePlayPause,
    setQuizMusic,
  } = useMusicPlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayFiredRef = useRef(false);

  // Clamp volume between 0 and 1 and apply to audio element
  const clampedVolume = Math.min(1, Math.max(0, volume));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, [clampedVolume]);

  // Attempt autoplay once on mount (only if autoPlay prop is true)
  useEffect(() => {
    if (!autoPlay) return;
    if (autoPlayFiredRef.current) return;
    autoPlayFiredRef.current = true;

    if (!currentMusicUrl || currentMusicUrl === "") {
      setQuizMusic("/media/default.mp3");
    }

    if (!isPlaying) {
      togglePlayPause();
    }

    // Retry after a short delay in case the browser blocks immediate autoplay
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Autoplay blocked; user can still click the speaker button
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  // Only run on mount — do NOT re-run when isPlaying or currentMusicUrl change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle audio loading and playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentMusicUrl]);

  // Load audio when URL changes (only if different from current)
  useEffect(() => {
    if (audioRef.current && currentMusicUrl && audioRef.current.src !== new URL(currentMusicUrl, window.location.origin).href) {
      audioRef.current.src = currentMusicUrl;
      audioRef.current.load();
    }
  }, [currentMusicUrl]);

  const handlePlayPause = () => {
    // If no music is set, set default music first
    if (!currentMusicUrl || currentMusicUrl === "") {
      setQuizMusic("/media/default.mp3");
      setTimeout(() => {
        togglePlayPause();
      }, 100);
    } else {
      togglePlayPause();
    }
  };

  const handleEnded = () => {
    // Loop current song
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  return (
    <>
      {/* Simple Speaker Icon */}
      <button
        onClick={handlePlayPause}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 md:w-14 md:h-14 bg-amber-100/90 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-amber-700/20 hover:bg-white transition-all group active:scale-90"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? (
          // Active Speaker Icon
          <svg className="w-6 h-6 md:w-7 md:h-7 text-black group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          // Inactive Speaker Icon
          <svg className="w-6 h-6 md:w-7 md:h-7 text-black group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentMusicUrl}
        onEnded={handleEnded}
        onError={(e) => console.error('Audio error:', e)}
        className="hidden"
      />
    </>
  );
}
