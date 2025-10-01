import React, { useEffect, useState } from 'react';
import { Play, Heart, Plus, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Song } from '../types';
import { getAllSongs } from '../services/firebase';
import { useAudio } from '../context/AudioContext';
import { useFavorites } from '../context/FavoritesContext';
import { SongToPlaylistModal } from './SongToPlaylistModal';

export const Visualizer: React.FC = () => {
  const [latestSongs, setLatestSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { playSong } = useAudio();
  const { addFavorite, removeFavorite, isSongFavorite } = useFavorites();

  useEffect(() => {
    const fetchLatestSongs = async () => {
      try {
        setLoading(true);
        const songs = await getAllSongs();
        // Lấy 6 bài hát mới nhất
        setLatestSongs(songs.slice(0, 6));
      } catch (error) {
        console.error('Error fetching latest songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSongs();
  }, []);

  const handlePlaySong = (song: Song) => {
    playSong(song, latestSongs);
  };

  const handleFavoriteToggle = (song: Song) => {
    if (isSongFavorite(song.id)) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    setSelectedSong(song);
    setPlaylistModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full h-32 bg-card rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải bài hát mới...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-4">Bài hát mới nhất</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {latestSongs.map((song) => (
          <div
            key={song.id}
            className="bg-card rounded-lg p-3 hover:bg-accent transition-colors group"
          >
            <div className="relative mb-2">
              <img
                src={song.imageUrl}
                alt={song.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <Button
                size="sm"
                onClick={() => handlePlaySong(song)}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-8 h-8 p-0"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm truncate flex-1">{song.title}</h4>
                {song.sourceType === 'youtube' && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                    <Youtube className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFavoriteToggle(song)}
                  className="h-6 w-6 p-0"
                >
                  <Heart className={`h-3 w-3 ${isSongFavorite(song.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddToPlaylist(song)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedSong && (
        <SongToPlaylistModal
          isOpen={playlistModalOpen}
          onClose={() => {
            setPlaylistModalOpen(false);
            setSelectedSong(null);
          }}
          song={selectedSong}
        />
      )}
    </div>
  );
};