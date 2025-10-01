import React, { useState } from 'react';
import { Search, User, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AuthModal } from './AuthModal';
import { SearchResults } from './SearchResults';
import { AdminPanel } from './AdminPanel';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm bài hát, ca sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          
          {user?.role === 'admin' && <AdminPanel />}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.role === 'admin' && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        <Shield className="h-3 w-3" />
                      </Badge>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span>{user.displayName}</span>
                    {user.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground">{user.email}</div>
                </DropdownMenuItem>
                
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground cursor-default">
                      <Shield className="mr-2 h-4 w-4" />
                      Quản trị viên
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setShowAuthModal(true)}>
              <User className="mr-2 h-4 w-4" />
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {showSearchResults && (
        <SearchResults 
          query={searchQuery}
          isOpen={showSearchResults}
          onClose={() => setShowSearchResults(false)}
        />
      )}
    </>
  );
};