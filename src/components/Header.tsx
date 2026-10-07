import { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  Search, 
  X, 
  Link as LinkIcon, 
  History, 
  Key
} from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onHomeClick: () => void;
  onOpenDirectUrl: () => void;
  onOpenApiKeyModal: () => void;
  onOpenHistoryModal: () => void;
  savedCount: number;
  historyCount: number;
  apiKeyValid: boolean;
}

export const Header = ({
  onSearch,
  searchQuery,
  setSearchQuery,
  onHomeClick,
  onOpenDirectUrl,
  onOpenApiKeyModal,
  onOpenHistoryModal,
  savedCount,
  historyCount,
  apiKeyValid,
}: HeaderProps) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsMobileSearchOpen(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
            title="Go to UsTube Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                  UsTube
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 hidden sm:inline-block">
                  v3 API
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:inline -mt-1">
                YouTube Video Player
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube videos, topics, or channels..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-l-full py-2.5 pl-4 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700/90 text-zinc-200 border border-l-0 border-zinc-700/80 rounded-r-full px-5 py-2.5 transition-colors flex items-center justify-center cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-zinc-300" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile search trigger */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Paste URL / Video ID Button */}
          <button
            onClick={onOpenDirectUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-full transition-all cursor-pointer hover:border-red-500/60 shadow-sm"
            title="Paste any YouTube URL or Video ID to play"
          >
            <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Play URL / ID</span>
            <span className="sm:hidden">URL</span>
          </button>

          {/* History / Saved Drawer Trigger */}
          <button
            onClick={onOpenHistoryModal}
            className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title="Watch History & Bookmarks"
          >
            <History className="w-5 h-5" />
            {(savedCount > 0 || historyCount > 0) && (
              <span className="absolute 0 top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-zinc-950" />
            )}
          </button>

          {/* API Key Modal Trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className="relative flex items-center gap-1.5 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title="YouTube Data API v3 Configuration"
          >
            <Key className="w-5 h-5" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                apiKeyValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile search expanded form */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube..."
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-700 rounded-l-full py-2 pl-4 pr-9 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-l-0 border-zinc-700 rounded-r-full px-4 py-2"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
