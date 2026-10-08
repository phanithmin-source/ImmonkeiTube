import { useState, useEffect, useRef } from 'react';
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input, textarea, etc.
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        } else {
          setIsMobileSearchOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsMobileSearchOpen(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl p-1 -ml-1 transition-all"
            title="Go to ImmonkeiTube Home"
          >
            {/* Mascot Icon Container */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-red-500/30 p-0.5 shadow-md shadow-red-600/10 group-hover:border-red-500/60 group-hover:shadow-red-600/25 group-hover:scale-105 transition-all duration-200 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/immonkeitube-logo.webp"
                alt="ImmonkeiTube Logo"
                className="w-full h-full object-contain scale-125 group-hover:scale-130 transition-transform duration-200"
              />
            </div>

            {/* Typography */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                  Immonkei<span className="text-red-500">Tube</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 hidden sm:inline-block">
                  v3 API
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline -mt-0.5 tracking-wide">
                YouTube Video Player
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube videos, topics, or channels..."
                className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-l-full py-2.5 pl-10 pr-20 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-all shadow-inner"
              />
              
              {/* Shortcut hint or Clear button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded shadow-sm">
                    /
                  </kbd>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700/90 active:bg-zinc-700 text-zinc-200 border border-l-0 border-zinc-700/80 rounded-r-full px-5 py-2.5 transition-colors flex items-center justify-center cursor-pointer shadow-sm hover:text-white"
              title="Search"
            >
              <Search className="w-4 h-4 text-zinc-300" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title="Search"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Creator Credit Badge */}
          <a
            href="https://immonkei.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-white/[0.08] hover:border-red-500/40 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm group"
            title="Prompted by Immonkei.dev"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[11px] text-zinc-400">Prompted by <strong className="text-zinc-200 group-hover:text-red-400 font-semibold transition-colors">Immonkei.dev</strong></span>
          </a>

          {/* Paste URL / Video ID Button */}
          <button
            onClick={onOpenDirectUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-full transition-all cursor-pointer hover:border-red-500/60 shadow-sm hover:scale-[1.02]"
            title="Paste any YouTube URL or Video ID to play directly"
          >
            <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            <span className="hidden sm:inline">Play URL / ID</span>
            <span className="sm:hidden">URL</span>
          </button>

          {/* Library / Watch History & Saved Drawer Trigger */}
          <button
            onClick={onOpenHistoryModal}
            className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title={`Library (${historyCount} history, ${savedCount} saved)`}
            aria-label="Watch History and Saved Videos"
          >
            <History className="w-5 h-5" />
            {(savedCount > 0 || historyCount > 0) && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-zinc-950"></span>
              </span>
            )}
          </button>

          {/* API Key Modal Trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className="relative flex items-center p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title={apiKeyValid ? 'YouTube Data API connected' : 'YouTube Data API key needed / demo mode'}
            aria-label="Configure YouTube API Key"
          >
            <Key className="w-5 h-5" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-zinc-950 ${
                apiKeyValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile search expanded form */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-zinc-800/80">
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
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-l-0 border-zinc-700 rounded-r-full px-4 py-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
