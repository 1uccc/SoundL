import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, AudioState } from '../types';
import { YouTubePlayer, YT_PLAYER_STATE, extractYouTubeVideoId } from '../components/YouTubePlayer';

interface AudioContextType extends AudioState {
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  playTrack: (song: Song, queue?: Song[], index?: number) => void; // Alias cho playSong
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  clearAudioState: () => void; // Thêm function để clear state
  audioRef: React.RefObject<HTMLAudioElement>;
  addToRecentSongs: (song: Song) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    queue: [],
    currentIndex: 0,
    repeat: 'none',
    shuffle: false,
    recentSongs: []
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      // Only update if we have valid values and current song is not a YouTube song
      if (!currentVideoId) {
        const currentTime = isNaN(audio.currentTime) ? 0 : Math.max(0, audio.currentTime);
        const duration = isNaN(audio.duration) ? 0 : Math.max(0, audio.duration);
        
        setAudioState(prev => ({
          ...prev,
          currentTime,
          duration
        }));
      }
    };

    const handleLoadStart = () => {
      if (!currentVideoId) {
        setAudioState(prev => ({
          ...prev,
          currentTime: 0,
          duration: 0
        }));
      }
    };

    const handleLoadedMetadata = () => {
      if (!currentVideoId) {
        const duration = isNaN(audio.duration) ? 0 : Math.max(0, audio.duration);
        setAudioState(prev => ({
          ...prev,
          currentTime: 0,
          duration
        }));
      }
    };

    const handleEnded = () => {
      if (audioState.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
        setAudioState(prev => ({ ...prev, currentTime: 0 }));
      } else {
        nextSong();
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioState.repeat, currentVideoId]);

  const playSong = (song: Song, queue: Song[] = [song], index: number = 0) => {
    // Dừng bài hiện tại trước khi chuyển
    if (youtubePlayer) {
      youtubePlayer.pauseVideo();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Add to recent songs history
    addToRecentSongs(song);

    // Reset state ngay lập tức với currentTime = 0 để tránh hiển thị thời gian cũ
    setAudioState(prev => ({
      ...prev,
      currentSong: song,
      queue,
      currentIndex: index,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    }));

    // Clear current video if switching to non-YouTube song
    if (song.sourceType !== 'youtube') {
      setCurrentVideoId(null);
    }

    if (song.sourceType === 'youtube' && song.youtubeUrl) {
      const videoId = extractYouTubeVideoId(song.youtubeUrl);
      if (videoId) {
        setCurrentVideoId(videoId);
        // Immediately reset timeline for YouTube
        setAudioState(prev => ({ 
          ...prev, 
          currentTime: 0, 
          duration: 0,
          isPlaying: false 
        }));
        // YouTube player sẽ tự động play khi ready
        setTimeout(() => {
          setAudioState(prev => ({ ...prev, isPlaying: true }));
        }, 500);
        return;
      }
    }

    // Handle regular audio files
    if (audioRef.current && song.audioUrl) {
      // Force reset currentTime immediately
      setAudioState(prev => ({ 
        ...prev, 
        currentTime: 0, 
        duration: 0 
      }));
      
      audioRef.current.src = song.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      
      const handleLoadStart = () => {
        setAudioState(prev => ({ 
          ...prev, 
          currentTime: 0, 
          duration: 0 
        }));
      };
      
      const handleLoadedMetadata = () => {
        const duration = isNaN(audioRef.current?.duration || 0) ? 0 : audioRef.current?.duration || 0;
        setAudioState(prev => ({ 
          ...prev, 
          currentTime: 0, 
          duration 
        }));
      };
      
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            audioRef.current.currentTime = 0; // Ensure reset before playing
            await audioRef.current.play();
            setAudioState(prev => ({ ...prev, isPlaying: true }));
          }
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      };
      
      audioRef.current.addEventListener('loadstart', handleLoadStart, { once: true });
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      audioRef.current.addEventListener('canplay', playAudio, { once: true });
    }
  };

  const pauseSong = () => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    if (currentVideoId && youtubePlayer) {
      youtubePlayer.pauseVideo();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeSong = () => {
    setAudioState(prev => ({ ...prev, isPlaying: true }));
    if (currentVideoId && youtubePlayer) {
      youtubePlayer.playVideo();
    } else if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const nextSong = () => {
    const { queue, currentIndex, shuffle, repeat } = audioState;
    let nextIndex;

    if (shuffle) {
      // Tránh lặp bài hiện tại khi shuffle
      if (queue.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentIndex);
      } else {
        nextIndex = currentIndex;
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else if (repeat === 'none') {
          return; // Dừng phát khi hết danh sách và không lặp
        } else {
          return;
        }
      }
    }

    const nextSongItem = queue[nextIndex];
    if (nextSongItem) {
      playSong(nextSongItem, queue, nextIndex);
    }
  };

  const previousSong = () => {
    const { queue, currentIndex } = audioState;
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevSong = queue[prevIndex];
      playSong(prevSong, queue, prevIndex);
    }
  };

  const setVolume = (volume: number) => {
    setAudioState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const seekTo = (time: number) => {
    const safeTime = Math.max(0, time);
    
    if (currentVideoId && youtubePlayer) {
      youtubePlayer.seekTo(safeTime, true);
      setAudioState(prev => ({ ...prev, currentTime: safeTime }));
    } else if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const maxTime = audioRef.current.duration || 0;
      const clampedTime = Math.min(safeTime, maxTime);
      audioRef.current.currentTime = clampedTime;
      setAudioState(prev => ({ ...prev, currentTime: clampedTime }));
    }
  };

  const toggleRepeat = () => {
    setAudioState(prev => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'one' : prev.repeat === 'one' ? 'all' : 'none'
    }));
  };

  const toggleShuffle = () => {
    setAudioState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const clearAudioState = useCallback(() => {
    // Dừng tất cả audio
    if (youtubePlayer) {
      youtubePlayer.pauseVideo();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Clear YouTube player
    setCurrentVideoId(null);
    setYoutubePlayer(null);
    
    // Reset audio state về trạng thái ban đầu
    setAudioState({
      currentSong: null,
      isPlaying: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      queue: [],
      currentIndex: 0,
      repeat: 'none',
      shuffle: false,
      recentSongs: []
    });
  }, [youtubePlayer]);

  const addToRecentSongs = useCallback((song: Song) => {
    setAudioState(prev => {
      const existingIndex = prev.recentSongs.findIndex(s => s.id === song.id);
      let newRecentSongs = [...prev.recentSongs];
      
      if (existingIndex !== -1) {
        // Remove existing song from current position
        newRecentSongs.splice(existingIndex, 1);
      }
      
      // Add song to the beginning
      newRecentSongs.unshift(song);
      
      // Keep only last 10 songs
      newRecentSongs = newRecentSongs.slice(0, 10);
      
      return {
        ...prev,
        recentSongs: newRecentSongs
      };
    });
  }, []);

  const value: AudioContextType = {
    ...audioState,
    playSong,
    playTrack: playSong, // Alias cho playSong
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    seekTo,
    toggleRepeat,
    toggleShuffle,
    clearAudioState,
    audioRef,
    addToRecentSongs
  };

  const handleYouTubeReady = (player: any) => {
    setYoutubePlayer(player);
    const duration = player.getDuration();
    if (duration > 0) {
      handleYouTubeDurationChange(duration);
    }
    // Reset timeline when player is ready
    setAudioState(prev => ({ 
      ...prev, 
      currentTime: 0,
      duration: duration > 0 ? duration : 0
    }));
    console.log('YouTube player ready');
  };

  const handleYouTubeStateChange = (state: number) => {
    switch (state) {
      case YT_PLAYER_STATE.PLAYING:
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        // Update duration when playing starts
        if (youtubePlayer) {
          const duration = youtubePlayer.getDuration();
          if (duration > 0) {
            setAudioState(prev => ({ ...prev, duration }));
          }
        }
        break;
      case YT_PLAYER_STATE.PAUSED:
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        break;
      case YT_PLAYER_STATE.ENDED:
        if (audioState.repeat === 'one') {
          // Replay current song
          if (youtubePlayer) {
            youtubePlayer.seekTo(0, true);
            youtubePlayer.playVideo();
            setAudioState(prev => ({ ...prev, currentTime: 0 }));
          }
        } else {
          nextSong();
        }
        break;
      case YT_PLAYER_STATE.BUFFERING:
        // Ensure timeline is updated during buffering
        if (youtubePlayer) {
          const currentTime = youtubePlayer.getCurrentTime();
          const duration = youtubePlayer.getDuration();
          setAudioState(prev => ({ 
            ...prev, 
            currentTime: currentTime || 0,
            duration: duration || prev.duration
          }));
        }
        break;
    }
  };

  const handleYouTubeTimeUpdate = (currentTime: number) => {
    // Ensure valid time values
    const safeCurrentTime = isNaN(currentTime) ? 0 : Math.max(0, currentTime);
    setAudioState(prev => ({ ...prev, currentTime: safeCurrentTime }));
  };

  const handleYouTubeDurationChange = (duration: number) => {
    // Ensure valid duration value
    const safeDuration = isNaN(duration) ? 0 : Math.max(0, duration);
    setAudioState(prev => ({ ...prev, duration: safeDuration }));
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
      {currentVideoId && (
        <YouTubePlayer
          videoId={currentVideoId}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          onTimeUpdate={handleYouTubeTimeUpdate}
          volume={audioState.volume * 100}
          playing={audioState.isPlaying}
          currentTime={audioState.currentTime}
        />
      )}
    </AudioContext.Provider>
  );
};