import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SongList } from './SongList';
import { searchSongs } from '../services/firebase';
import { Song } from '../types';
import { Loader2 } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ query, isOpen, onClose }) => {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() && isOpen) {
      setLoading(true);
      searchSongs(query)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [query, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Kết quả tìm kiếm cho "{query}"</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="overflow-y-auto">
            <SongList songs={results} />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy kết quả nào
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};