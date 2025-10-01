import React, { useState, useEffect, useCallback } from 'react';
import { SongList } from './SongList';
import { Visualizer } from './Visualizer';
import { PlaylistEditor } from './PlaylistEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Shuffle, Clock, Heart, Filter, Settings } from 'lucide-react';
import { getAllAccessiblePlaylists, getAllSongs, getPublicPlaylists, getUserInfo } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useFavorites } from '../context/FavoritesContext';
import { Song, Playlist } from '../types';



interface MainContentProps {
  currentView: string;
  refreshKey?: number;
  onViewChange: (view: string) => void;
  onPlaylistChange?: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  currentView, 
  refreshKey, 
  onViewChange,
  onPlaylistChange 
}) => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<(Playlist & { ownerName?: string })[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { user } = useAuth();
  const { playTrack, recentSongs } = useAudio();
  const { favorites } = useFavorites();

  // Get current playlist from view (bao gồm cả public playlists)
  const allAvailablePlaylists = [...playlists, ...publicPlaylists];
  const currentPlaylist = allAvailablePlaylists.find(p => currentView === `playlist-${p.id}`);

  const handlePlaylistUpdate = () => {
    if (onPlaylistChange) {
      onPlaylistChange();
    }
  };

  const loadSongs = useCallback(async () => {
    try {
      const songs = await getAllSongs();
      setAllSongs(songs);
      
      // Recent songs will be set from AudioContext
      setFilteredSongs(songs.filter(song => song.isActive !== false));
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  }, []);



  // Filter songs by genre
  useEffect(() => {
    const activeSongs = allSongs.filter(song => song.isActive !== false);
    if (selectedGenre === 'all') {
      setFilteredSongs(activeSongs);
    } else {
      setFilteredSongs(activeSongs.filter(song => song.genre === selectedGenre));
    }
  }, [allSongs, selectedGenre]);

  // Get unique genres for filter
  const getUniqueGenres = () => {
    const genres = allSongs
      .filter(song => song.isActive !== false && song.genre)
      .map(song => song.genre!)
      .filter((genre, index, array) => array.indexOf(genre) === index)
      .sort();
    return genres;
  };

  const loadPlaylists = useCallback(async () => {
    if (user) {
      try {
        const allPlaylists = await getAllAccessiblePlaylists(user.id);
        setPlaylists(allPlaylists);
        
        // Load public playlists từ users khác cho mục "Dành cho bạn"
        const publicPlaylistsData = await getPublicPlaylists();
        // Lọc ra chỉ những playlist không phải của user hiện tại
        const otherUsersPublicPlaylists = publicPlaylistsData.filter(p => p.createdBy !== user.id);
        
        // Lấy thông tin tên chủ sở hữu cho mỗi playlist
        const playlistsWithOwnerNames = await Promise.all(
          otherUsersPublicPlaylists.map(async (playlist) => {
            const ownerInfo = await getUserInfo(playlist.createdBy);
            return {
              ...playlist,
              ownerName: ownerInfo?.displayName || 'Unknown User'
            };
          })
        );
        
        setPublicPlaylists(playlistsWithOwnerNames);
      } catch (error) {
        console.error('Failed to load playlists:', error);
        setPlaylists([]);
        setPublicPlaylists([]);
      }
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
    loadSongs();
  }, [user, refreshKey, loadSongs, loadPlaylists]);

  // Refresh songs every 30 seconds to catch new additions
  useEffect(() => {
    const interval = setInterval(loadSongs, 30000);
    return () => clearInterval(interval);
  }, [loadSongs]);

  const handlePlayAll = (songs: Song[]) => {
    if (songs.length > 0) {
      playTrack(songs[0], songs);
    }
  };

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
    setPlaylists(prev => 
      prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p)
    );
    setEditingPlaylist(null);
    if (onPlaylistChange) {
      onPlaylistChange();
    }
  };

  const handlePlaylistDeleted = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    setEditingPlaylist(null);
    onViewChange('home');
    if (onPlaylistChange) {
      onPlaylistChange();
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6">Chào mừng trở lại</h1>
              

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Nghe gần đây</h2>
                </div>
                {recentSongs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {recentSongs.map((song) => (
                      <Card key={song.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => playTrack(song, [song])}>
                        <CardContent className="p-4">
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="w-full aspect-square object-cover rounded mb-3"
                          />
                          <h3 className="font-medium text-sm truncate">{song.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Chưa có bài hát nào được phát</p>
                )}
              </div>


              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Dành cho bạn</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                  <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onViewChange('favorites')}>
                    <CardContent className="p-4">
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded mb-3 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-medium text-sm">Bài hát yêu thích</h3>
                      <p className="text-xs text-muted-foreground">{favorites.length} bài hát</p>
                    </CardContent>
                  </Card>
                  

                  {publicPlaylists.slice(0, 4).map((playlist) => (
                    <Card key={playlist.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onViewChange(`playlist-${playlist.id}`)}>
                      <CardContent className="p-4">
                        <img
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          className="w-full aspect-square object-cover rounded mb-3"
                        />
                        <h3 className="font-medium text-sm truncate">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">Bởi {playlist.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{playlist.songs.length} bài hát</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            <Visualizer />
          </div>
        );

      case 'search':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Tìm kiếm nhạc</h1>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {getUniqueGenres().map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SongList songs={filteredSongs} onPlaylistUpdated={handlePlaylistUpdate} />
          </div>
        );

      case 'library':
        return (
          <div>
            <h1 className="text-3xl font-bold mb-6">Thư viện của bạn</h1>
            

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Playlist của bạn</h2>
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {playlists.map((playlist) => (
                    <Card key={playlist.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onViewChange(`playlist-${playlist.id}`)}>
                      <CardContent className="p-4">
                        <img
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          className="w-full aspect-square object-cover rounded mb-3"
                        />
                        <h3 className="font-medium text-sm truncate">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
                        <p className="text-xs text-muted-foreground">{playlist.songs.length} bài hát</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Bạn chưa có playlist nào</p>
              )}
            </div>


            <div>
              <h2 className="text-xl font-semibold mb-4">Tất cả bài hát</h2>
              <SongList songs={allSongs.filter(song => song.isActive !== false)} onPlaylistUpdated={handlePlaylistUpdate} />
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div>
            <div className="flex items-start space-x-6 mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center">
                <Heart className="h-16 w-16 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground">Playlist</p>
                <h1 className="text-4xl font-bold mb-2">Bài hát yêu thích</h1>
                <p className="text-muted-foreground mb-4">Những bài hát bạn đã thích</p>
                <p className="text-muted-foreground mb-6">{favorites.length} bài hát</p>
                <div className="flex space-x-2">
                  <Button 
                    size="lg"
                    onClick={() => handlePlayAll(favorites)}
                    disabled={favorites.length === 0}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Phát
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handlePlayAll([...favorites].sort(() => Math.random() - 0.5))}
                    disabled={favorites.length === 0}
                  >
                    <Shuffle className="h-5 w-5 mr-2" />
                    Phát ngẫu nhiên
                  </Button>
                </div>
              </div>
            </div>
            {favorites.length > 0 ? (
              <SongList songs={favorites} onPlaylistUpdated={handlePlaylistUpdate} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có bài hát yêu thích nào</p>
                <p className="text-sm">Nhấn vào icon trái tim để thêm bài hát yêu thích</p>
              </div>
            )}
          </div>
        );

      default:
        if (currentPlaylist) {
          return (
            <div>
              <div className="flex items-start space-x-6 mb-6">
                <img 
                  src={currentPlaylist.imageUrl} 
                  alt={currentPlaylist.name}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <p className="text-muted-foreground">Playlist</p>
                  <h1 className="text-4xl font-bold mb-2">{currentPlaylist.name}</h1>
                  <p className="text-muted-foreground mb-4">{currentPlaylist.description}</p>
                  <p className="text-muted-foreground mb-6">{currentPlaylist.songs.length} bài hát</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="lg"
                      onClick={() => handlePlayAll(currentPlaylist.songs)}
                      disabled={currentPlaylist.songs.length === 0}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Phát
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handlePlayAll([...currentPlaylist.songs].sort(() => Math.random() - 0.5))}
                      disabled={currentPlaylist.songs.length === 0}
                    >
                      <Shuffle className="h-5 w-5 mr-2" />
                      Phát ngẫu nhiên
                    </Button>
                    {user && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setEditingPlaylist(currentPlaylist)}
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        Chỉnh sửa playlist
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {currentPlaylist.songs.length > 0 ? (
                <SongList songs={currentPlaylist.songs} onPlaylistUpdated={handlePlaylistUpdate} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Playlist này chưa có bài hát nào.
                </p>
              )}
            </div>
          );
        } else {
          return (
            <div className="text-center py-8 text-muted-foreground">
              <p>Playlist không tồn tại</p>
            </div>
          );
        }
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      {renderContent()}
      
      {editingPlaylist && (
        <PlaylistEditor
          isOpen={!!editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
          playlist={editingPlaylist}
          onPlaylistUpdated={handlePlaylistUpdated}
          onPlaylistDeleted={handlePlaylistDeleted}
        />
      )}
    </div>
  );
};