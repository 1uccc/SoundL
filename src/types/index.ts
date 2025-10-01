export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  youtubeUrl?: string;
  sourceType?: 'file' | 'youtube';
  genre: string;
  createdBy?: string;
  createdAt?: Date;
  isActive?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  songs: Song[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  playlists: string[];
  role?: 'user' | 'admin';
}

export interface AudioState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
  recentSongs: Song[];
}