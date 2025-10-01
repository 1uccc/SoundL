import React, { useState } from 'react';
import { Play, MoreHorizontal, Clock, Heart, Youtube, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAudio } from '../context/AudioContext';
import { useFavorites } from '../context/FavoritesContext';
import { Song } from '../types';
import { SongToPlaylistModal } from './SongToPlaylistModal';

interface SongListProps {
  songs: Song[];
  showHeader?: boolean;
  onPlaylistUpdated?: () => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, showHeader = true, onPlaylistUpdated }) => {
  const { playSong, currentSong, isPlaying } = useAudio();
  const { addFavorite, removeFavorite, isSongFavorite } = useFavorites();
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: Song, index: number) => {
    playSong(song, songs, index);
  };

  const handleFavoriteToggle = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (isSongFavorite(song.id)) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setPlaylistModalOpen(true);
  };

  return (
    <div className="w-full">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Bài hát</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="w-20">
                <Clock className="h-4 w-4" />
              </TableHead>
              <TableHead className="w-16"></TableHead>
              <TableHead className="w-16"></TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {songs.map((song, index) => (
            <TableRow 
              key={song.id} 
              className="group hover:bg-muted/50 cursor-pointer"
              onClick={() => handlePlaySong(song, index)}
            >
              <TableCell>
                <div className="flex items-center justify-center">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-primary animate-pulse"></div>
                      <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="h-4 w-4 hidden group-hover:block" />
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <img 
                    src={song.imageUrl} 
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <div className={`font-medium ${currentSong?.id === song.id ? 'text-primary' : ''} flex items-center gap-2`}>
                      <span>{song.title}</span>
                      {song.sourceType === 'youtube' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          <Youtube className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">{song.artist}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {song.album}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {song.duration > 0 ? (
                  formatDuration(song.duration)
                ) : (
                  <span className="text-xs text-muted-foreground">--:--</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleFavoriteToggle(e, song)}
                >
                  <Heart className={`h-4 w-4 ${isSongFavorite(song.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => handleAddToPlaylist(e, song)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Thêm vào playlist</DropdownMenuItem>
                    <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                    <DropdownMenuItem>Thêm vào hàng đợi</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <SongToPlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        song={selectedSong}
        onPlaylistUpdated={onPlaylistUpdated}
      />
    </div>
  );
};