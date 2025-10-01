import React, { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';
import { PlaylistManager } from './PlaylistManager';
import { PlaylistEditor } from './PlaylistEditor';
import { getAllAccessiblePlaylists } from '../services/firebase';
import { Playlist } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onPlaylistChange?: () => void;
  refreshKey?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onPlaylistChange, refreshKey }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const loadPlaylists = React.useCallback(async () => {
    if (user) {
      try {
        const allPlaylists = await getAllAccessiblePlaylists(user.id);
        setPlaylists(allPlaylists);
      } catch (error) {
        console.error('Failed to load playlists:', error);
        setPlaylists([]);
      }
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists, refreshKey]);

  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'search', label: 'Tìm kiếm', icon: Search },
    { id: 'library', label: 'Thư viện', icon: Library },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="sidebar-logo">SoundL</h1>
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView(item.id)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <Separator className="my-4" />

      <div className="px-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowPlaylistManager(true)}
          disabled={!user}
        >
          <Plus className="mr-3 h-4 w-4" />
          Tạo playlist
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setCurrentView('favorites')}
          disabled={!user}
        >
          <Heart className="mr-3 h-4 w-4" />
          Bài hát yêu thích
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 px-3">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="group relative">
                <Button
                  variant={currentView === `playlist-${playlist.id}` ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left pr-8"
                  onClick={() => setCurrentView(`playlist-${playlist.id}`)}
                >
                  <div className="truncate">
                    <div>{playlist.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {playlist.songs.length} bài hát
                    </div>
                  </div>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingPlaylist(playlist)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Chỉnh sửa playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <PlaylistManager
        isOpen={showPlaylistManager}
        onClose={() => setShowPlaylistManager(false)}
        onPlaylistCreated={(playlist) => {
          setPlaylists(prev => [...prev, playlist]);
          setShowPlaylistManager(false);
          onPlaylistChange?.();
        }}
      />
      
      {editingPlaylist && (
        <PlaylistEditor
          isOpen={true}
          onClose={() => setEditingPlaylist(null)}
          playlist={editingPlaylist}
          onPlaylistUpdated={(updatedPlaylist) => {
            setPlaylists(prev => prev.map(p => 
              p.id === updatedPlaylist.id ? updatedPlaylist : p
            ));
            setEditingPlaylist(null);
            onPlaylistChange?.();
            // Refresh current view if we're viewing this playlist
            if (currentView === `playlist-${updatedPlaylist.id}`) {
              setCurrentView('home');
              setTimeout(() => setCurrentView(`playlist-${updatedPlaylist.id}`), 100);
            }
          }}
          onPlaylistDeleted={(playlistId) => {
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));
            setEditingPlaylist(null);
            onPlaylistChange?.();
            // Navigate away if we're viewing the deleted playlist
            if (currentView === `playlist-${playlistId}`) {
              setCurrentView('home');
            }
          }}
        />
      )}
    </div>
  );
};