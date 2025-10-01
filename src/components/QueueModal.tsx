import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Play, Pause, X, Youtube } from 'lucide-react';
import { Badge } from './ui/badge';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({ isOpen, onClose }) => {
  const { queue, currentIndex, currentSong, isPlaying, playSong, pauseSong, resumeSong } = useAudio();

  const handlePlaySong = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      playSong(song, queue, index);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Danh sách chờ</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Các bài hát trong hàng chờ phát. Nhấp vào bài hát để phát ngay.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-2">
          {queue.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Danh sách chờ trống</p>
            </div>
          ) : (
            queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors ${
                  index === currentIndex ? 'bg-accent' : ''
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePlaySong(song, index)}
                  className="w-8 h-8 p-0"
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm">{song.title}</span>
                    {song.sourceType === 'youtube' && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                        <Youtube className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                </div>

                <span className="text-xs text-muted-foreground">
                  {formatTime(song.duration)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {queue.length} bài hát • {currentIndex + 1}/{queue.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};