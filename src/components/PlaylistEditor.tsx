import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Camera, Trash2, Music, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updatePlaylist, deletePlaylist } from '../services/firebase';
import { Playlist, Song } from '../types';
import { toast } from 'sonner@2.0.3';
// Import removed - will use direct API call

interface PlaylistEditorProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  onPlaylistUpdated: (playlist: Playlist) => void;
  onPlaylistDeleted: (playlistId: string) => void;
}

export const PlaylistEditor: React.FC<PlaylistEditorProps> = ({ 
  isOpen, 
  onClose, 
  playlist,
  onPlaylistUpdated,
  onPlaylistDeleted
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [playlistData, setPlaylistData] = useState({
    name: playlist.name,
    description: playlist.description,
    imageUrl: playlist.imageUrl,
    isPublic: playlist.isPublic,
    songs: [...playlist.songs]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updatedPlaylist = await updatePlaylist(playlist.id, playlistData);
      onPlaylistUpdated(updatedPlaylist);
      toast.success('Playlist đã được cập nhật thành công!');
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật playlist!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await deletePlaylist(playlist.id);
      onPlaylistDeleted(playlist.id);
      toast.success('Playlist đã được xóa thành công!');
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa playlist!');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = (songId: string) => {
    setPlaylistData(prev => ({
      ...prev,
      songs: prev.songs.filter(song => song.id !== songId)
    }));
  };

  const handleImageChange = async (query: string) => {
    setImageLoading(true);
    try {
      // Sử dụng predefined images cho demo
      const fallbackImages = {
        'music waves': 'https://images.unsplash.com/photo-1617994452722-4145e196248b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
        'vinyl records': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        'music studio': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
        'headphones': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
        'concert stage': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
        'abstract music': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop'
      };
      
      setPlaylistData(prev => ({
        ...prev,
        imageUrl: fallbackImages[query as keyof typeof fallbackImages] || fallbackImages['music waves']
      }));
      toast.success('Ảnh playlist đã được cập nhật!');
    } catch (error) {
      toast.error('Không thể tải ảnh mới. Vui lòng thử lại!');
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Trong thực tế, bạn sẽ upload file lên Firebase Storage
      // Ở đây tôi sẽ tạo URL tạm thời cho demo
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPlaylistData(prev => ({
            ...prev,
            imageUrl: e.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const suggestedImages = [
    'music waves',
    'vinyl records',
    'music studio',
    'headphones',
    'concert stage',
    'abstract music'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Chỉnh sửa playlist
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa playlist
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa playlist</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa playlist "{playlist.name}"? 
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePlaylist} disabled={loading}>
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin playlist của bạn, thay đổi ảnh cover, thêm hoặc xóa bài hát.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Playlist Image Section */}
            <div className="space-y-4">
              <Label>Ảnh playlist</Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={playlistData.imageUrl}
                    alt="Playlist cover"
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải ảnh lên
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Hoặc chọn ảnh từ thư viện:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {suggestedImages.map((query) => (
                      <Button
                        key={query}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleImageChange(query)}
                        disabled={imageLoading}
                        className="text-xs"
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên playlist</Label>
                <Input
                  id="name"
                  value={playlistData.name}
                  onChange={(e) => setPlaylistData({ ...playlistData, name: e.target.value })}
                  placeholder="Nhập tên playlist..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={playlistData.description}
                  onChange={(e) => setPlaylistData({ ...playlistData, description: e.target.value })}
                  placeholder="Mô tả về playlist..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Công khai</Label>
                <Switch
                  id="isPublic"
                  checked={playlistData.isPublic}
                  onCheckedChange={(checked) => setPlaylistData({ ...playlistData, isPublic: checked })}
                />
              </div>
            </div>

            {/* Songs List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Bài hát trong playlist ({playlistData.songs.length})</Label>
              </div>
              
              {playlistData.songs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Playlist chưa có bài hát nào</p>
                  <p className="text-sm">Thêm bài hát từ thư viện nhạc</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {playlistData.songs.map((song, index) => (
                    <div key={song.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="text-sm text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{song.title}</span>
                            {song.sourceType === 'youtube' && (
                              <Badge variant="secondary" className="text-xs">YouTube</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {song.artist}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSong(song.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || imageLoading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};