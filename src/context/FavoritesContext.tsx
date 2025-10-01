import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song } from '../types';
import { getUserFavorites, addToFavorites, removeFromFavorites, isFavorite } from '../services/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: Song[];
  isLoading: boolean;
  addFavorite: (song: Song) => Promise<void>;
  removeFavorite: (songId: string) => Promise<void>;
  isSongFavorite: (songId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const userFavorites = await getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Không thể tải bài hát yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const addFavorite = async (song: Song) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm bài hát yêu thích');
      return;
    }

    try {
      await addToFavorites(user.id, song.id);
      setFavorites(prev => [...prev, song]);
      toast.success(`Đã thêm "${song.title}" vào yêu thích`);
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Không thể thêm bài hát vào yêu thích');
    }
  };

  const removeFavorite = async (songId: string) => {
    if (!user) {
      return;
    }

    try {
      await removeFromFavorites(user.id, songId);
      setFavorites(prev => prev.filter(song => song.id !== songId));
      const song = favorites.find(s => s.id === songId);
      toast.success(`Đã xóa "${song?.title || 'bài hát'}" khỏi yêu thích`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Không thể xóa bài hát khỏi yêu thích');
    }
  };

  const isSongFavorite = (songId: string): boolean => {
    return favorites.some(song => song.id === songId);
  };

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isSongFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};