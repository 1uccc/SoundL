import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider, useAudio } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { MusicPlayer } from './components/MusicPlayer';
import { WelcomeScreen } from './components/WelcomeScreen';

// Component chính của ứng dụng - chỉ hiển thị khi đã đăng nhập
const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useAuth();
  const { clearAudioState } = useAudio();

  // Clear audio state khi user thay đổi (đăng xuất hoặc đăng nhập user khác)
  useEffect(() => {
    // Nếu không có user (đăng xuất), clear audio state
    if (!user) {
      clearAudioState();
    }
  }, [user, clearAudioState]);

  // Hiển thị loading trong khi kiểm tra auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-cyan-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị Welcome Screen
  if (!user) {
    return <WelcomeScreen />;
  }

  // Nếu đã đăng nhập, hiển thị ứng dụng chính
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          onPlaylistChange={() => setRefreshKey(prev => prev + 1)}
          refreshKey={refreshKey}
        />
        <MainContent 
          currentView={currentView} 
          refreshKey={refreshKey}
          onViewChange={setCurrentView}
          onPlaylistChange={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
      
      <MusicPlayer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <FavoritesProvider>
            <AudioProvider>
              <MainApp />
              <Toaster />
            </AudioProvider>
          </FavoritesProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}