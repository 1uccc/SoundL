import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Music, Upload, X, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { addSong } from '../services/firebase';
import { Song } from '../types';
import { extractYouTubeVideoId, getYouTubeThumbnail } from './YouTubePlayer';

interface SongFormData {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  youtubeUrl: string;
  sourceType: 'file' | 'youtube';
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: 0,
    imageUrl: '',
    audioUrl: '',
    youtubeUrl: '',
    sourceType: 'file'
  });

  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleInputChange = (field: keyof SongFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, youtubeUrl: url }));
    
    if (url) {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        // Auto-fill thumbnail if not already set
        if (!formData.imageUrl) {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: getYouTubeThumbnail(videoId, 'hqdefault')
          }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isRequiredFieldsFilled = formData.title && formData.artist && 
      ((formData.sourceType === 'file' && formData.audioUrl) || 
       (formData.sourceType === 'youtube' && formData.youtubeUrl));
    
    if (!isRequiredFieldsFilled) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate YouTube URL if using YouTube source
    if (formData.sourceType === 'youtube') {
      const videoId = extractYouTubeVideoId(formData.youtubeUrl);
      if (!videoId) {
        toast.error('URL YouTube không hợp lệ');
        return;
      }
    }

    setLoading(true);
    
    try {
      const songData: Omit<Song, 'id'> = {
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        genre: formData.genre,
        duration: formData.sourceType === 'youtube' ? 0 : formData.duration, // Set 0 for YouTube
        imageUrl: formData.imageUrl,
        audioUrl: formData.sourceType === 'file' ? formData.audioUrl : '',
        youtubeUrl: formData.sourceType === 'youtube' ? formData.youtubeUrl : undefined,
        sourceType: formData.sourceType,
        createdBy: user.id,
        createdAt: new Date(),
        isActive: true
      };

      await addSong(songData);
      
      toast.success('Thêm bài hát thành công!');
      setIsOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: 0,
        imageUrl: '',
        audioUrl: '',
        youtubeUrl: '',
        sourceType: 'file'
      });
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Có lỗi xảy ra khi thêm bài hát');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="default">
          <Plus className="w-4 h-4" />
          Thêm Bài Hát
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Thêm Bài Hát Mới
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tên Bài Hát *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Nhập tên bài hát"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="artist">Ca Sĩ *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    placeholder="Nhập tên ca sĩ"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="album">Album</Label>
                  <Input
                    id="album"
                    value={formData.album}
                    onChange={(e) => handleInputChange('album', e.target.value)}
                    placeholder="Nhập tên album"
                  />
                </div>
                
                <div>
                  <Label htmlFor="genre">Thể Loại</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="Nhập thể loại nhạc"
                  />
                </div>
                
                {formData.sourceType === 'file' && (
                  <div>
                    <Label htmlFor="duration">Thời Lượng (giây)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      placeholder="180"
                    />
                    {formData.duration > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Thời lượng: {formatDuration(formData.duration)}
                      </p>
                    )}
                  </div>
                )}
                
                {formData.sourceType === 'youtube' && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ⏱️ Thời lượng sẽ được tự động lấy từ YouTube
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media URLs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nguồn Nhạc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs 
                  value={formData.sourceType} 
                  onValueChange={(value: 'file' | 'youtube') => 
                    setFormData(prev => ({ ...prev, sourceType: value }))
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="gap-2">
                      <Upload className="w-4 h-4" />
                      File Audio
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="space-y-4">
                    <div>
                      <Label htmlFor="audioUrl">URL File Nhạc *</Label>
                      <Input
                        id="audioUrl"
                        value={formData.audioUrl}
                        onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                        placeholder="https://example.com/song.mp3"
                        required={formData.sourceType === 'file'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hỗ trợ: MP3, WAV, OGG
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="youtube" className="space-y-4">
                    <div>
                      <Label htmlFor="youtubeUrl">URL YouTube *</Label>
                      <Input
                        id="youtubeUrl"
                        value={formData.youtubeUrl}
                        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required={formData.sourceType === 'youtube'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hỗ trợ: URL video YouTube hoặc YouTube Music
                      </p>
                      {formData.youtubeUrl && !extractYouTubeVideoId(formData.youtubeUrl) && (
                        <p className="text-xs text-destructive mt-1">
                          URL YouTube không hợp lệ
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div>
                  <Label htmlFor="imageUrl">URL Ảnh Bìa</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ: JPG, PNG, WebP
                  </p>
                </div>
                
                {/* Preview */}
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Xem Trước Ảnh Bìa</Label>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.imageUrl}
                        alt="Song cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Card */}
          {(formData.title || formData.artist) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xem Trước</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {formData.title || 'Tên bài hát'}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {formData.artist || 'Ca sĩ'} • {formData.album || 'Album'}
                    </p>
                    {formData.duration > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(formData.duration)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.artist || 
                       (formData.sourceType === 'file' && !formData.audioUrl) ||
                       (formData.sourceType === 'youtube' && !formData.youtubeUrl)}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Đang Thêm...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Thêm Bài Hát
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};