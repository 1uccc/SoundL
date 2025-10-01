import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Repeat1, Shuffle, Heart, Youtube, Plus, List } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { useAudio } from '../context/AudioContext';
import { useFavorites } from '../context/FavoritesContext';
import { SongToPlaylistModal } from './SongToPlaylistModal';
import { QueueModal } from './QueueModal';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const MusicPlayer: React.FC = () => {
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeat,
    shuffle,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    seekTo,
    toggleRepeat,
    toggleShuffle
  } = useAudio();
  const { addFavorite, removeFavorite, isSongFavorite } = useFavorites();

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const totalSeconds = Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleFavoriteToggle = () => {
    if (!currentSong) return;
    
    if (isSongFavorite(currentSong.id)) {
      removeFavorite(currentSong.id);
    } else {
      addFavorite(currentSong);
    }
  };

  if (!currentSong) {
    return (
      <div className="h-20 bg-card border-t border-border flex items-center justify-center">
        <p className="text-muted-foreground">Chọn một bài hát để phát</p>
      </div>
    );
  }

  return (
    <div className="h-20 bg-card border-t border-border flex items-center justify-between px-4">
      {/* Current Song Info */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <img 
          src={currentSong.imageUrl} 
          alt={currentSong.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{currentSong.title}</span>
            {currentSong.sourceType === 'youtube' && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                <Youtube className="w-3 h-3" />
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground truncate">{currentSong.artist}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleFavoriteToggle}>
          <Heart className={`h-4 w-4 ${currentSong && isSongFavorite(currentSong.id) ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPlaylistModalOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleShuffle}
                className={shuffle ? 'text-primary' : ''}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{shuffle ? 'Tắt trộn bài' : 'Bật trộn bài'}</p>
            </TooltipContent>
          </Tooltip>
          
          <Button variant="ghost" size="sm" onClick={previousSong}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button size="sm" onClick={handlePlayPause} className="rounded-full w-8 h-8">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={nextSong}>
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRepeat}
                className={repeat !== 'none' ? 'text-primary' : ''}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {repeat === 'none' ? 'Không lặp lại' : 
                 repeat === 'one' ? 'Lặp một bài' : 
                 'Lặp tất cả'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-3 w-full max-w-lg">
          <span className="text-xs font-medium text-foreground/80 w-10 text-center tabular-nums">
            {formatTime(currentTime || 0)}
          </span>
          <div className="flex-1 relative group">
            <Slider
              value={[currentTime || 0]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {formatTime(currentTime || 0)} / {formatTime(duration || 0)}
            </div>
          </div>
          <span className="text-xs font-medium text-foreground/80 w-10 text-center tabular-nums">
            {formatTime(duration || 0)}
          </span>
        </div>
      </div>

      {/* Volume Control and Queue */}
      <div className="flex items-center space-x-2 flex-1 justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setQueueModalOpen(true)}>
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Danh sách chờ</p>
          </TooltipContent>
        </Tooltip>
        <Volume2 className="h-4 w-4" />
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-20"
        />
      </div>
      
      <SongToPlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        song={currentSong}
      />
      
      <QueueModal
        isOpen={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
      />
    </div>
  );
};