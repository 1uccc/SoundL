import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllAccessiblePlaylists, addSongToPlaylist } from '../services/firebase';
import { Song, Playlist } from '../types';
import { toast } from 'sonner@2.0.3';
import { PlaylistManager } from './PlaylistManager';

interface SongToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onPlaylistUpdated?: () => void;
}

export const SongToPlaylistModal: React.FC<SongToPlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  song,
  onPlaylistUpdated
}) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadPlaylists();
    }
  }, [isOpen, user]);

  const loadPlaylists = async () => {
    if (!user) return;
    
    try {
      const allPlaylists = await getAllAccessiblePlaylists(user.id);
      // Only show playlists the user can edit (their own playlists)
      const editablePlaylists = allPlaylists.filter(p => p.createdBy === user.id);
      setPlaylists(editablePlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast.error('Không thể tải danh sách playlist');
    }
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!song) return;

    setLoading(true);
    try {
      await addSongToPlaylist(playlist.id, song.id);
      toast.success(`Đã thêm "${song.title}" vào playlist "${playlist.name}"`);
      onPlaylistUpdated?.(); // Trigger refresh
      onClose();
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error('Không thể thêm bài hát vào playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = (newPlaylist: Playlist) => {
    setPlaylists(prev => [newPlaylist, ...prev]);
    setShowCreatePlaylist(false);
    onPlaylistUpdated?.(); // Trigger refresh
    if (song) {
      handleAddToPlaylist(newPlaylist);
    }
  };

  if (!song) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm vào playlist</DialogTitle>
            <DialogDescription>
              Chọn playlist để thêm bài hát "{song?.title}" vào.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <img 
                src={song.imageUrl} 
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreatePlaylist(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo playlist mới
            </Button>

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Bạn chưa có playlist nào</p>
                    <p className="text-sm">Tạo playlist đầu tiên để thêm bài hát</p>
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleAddToPlaylist(playlist)}
                    >
                      <img 
                        src={playlist.imageUrl} 
                        alt={playlist.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.songs.length} bài hát
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <PlaylistManager
        isOpen={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onPlaylistCreated={handleCreatePlaylist}
      />
    </>
  );
};