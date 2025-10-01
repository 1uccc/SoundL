import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useAuth } from '../context/AuthContext';
import { createPlaylist } from '../services/firebase';
import { Playlist } from '../types';
import { toast } from 'sonner@2.0.3';

interface PlaylistManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: (playlist: Playlist) => void;
  editingPlaylist?: Playlist;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ 
  isOpen, 
  onClose, 
  onPlaylistCreated,
  editingPlaylist 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState({
    name: editingPlaylist?.name || '',
    description: editingPlaylist?.description || '',
    isPublic: editingPlaylist?.isPublic || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const newPlaylist = await createPlaylist({
        name: playlistData.name,
        description: playlistData.description,
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        songs: [],
        createdBy: user.id,
        isPublic: playlistData.isPublic
      });

      onPlaylistCreated(newPlaylist);
      toast.success('Playlist đã được tạo thành công!');
      setPlaylistData({ name: '', description: '', isPublic: false });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo playlist!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPlaylist ? 'Chỉnh sửa playlist' : 'Tạo playlist mới'}
          </DialogTitle>
          <DialogDescription>
            {editingPlaylist 
              ? 'Thay đổi thông tin playlist của bạn' 
              : 'Tạo một playlist mới để lưu trữ những bài hát yêu thích'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex space-x-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Đang tạo...' : editingPlaylist ? 'Cập nhật' : 'Tạo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};