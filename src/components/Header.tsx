import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { 
  Search, 
  X, 
  Link as LinkIcon, 
  History, 
  Key,
  Sun,
  Moon
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
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}: HeaderProps) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.08] px-3 sm:px-5 py-2 transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Brand Logo Only */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onHomeClick}
            className="flex items-center justify-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-0.5 -ml-1 transition-transform duration-150 hover:scale-105 active:scale-95"
            title="ImmonkeiTube Home"
            aria-label="ImmonkeiTube Home"
          >
            <img
              src="/assets/immonkeitube-logo.png"
              alt="ImmonkeiTube Logo"
              className="w-8 h-8 sm:w-9.5 sm:h-9.5 object-contain drop-shadow-xs"
            />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Khmer songs, yearning ballads, tech..."
                className="w-full bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 rounded-l-full py-1.5 pl-9 pr-14 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all shadow-inner"
              />
              
              {/* Shortcut hint or Clear button */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700/60 rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/90 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-l-0 border-zinc-200 dark:border-zinc-700/80 rounded-r-full px-4 py-1.5 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            title="Search"
            aria-label="Toggle search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Paste URL / Video ID Button */}
          <button
            onClick={onOpenDirectUrl}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
            title="Paste any YouTube URL or Video ID to play directly"
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Play URL</span>
            <span className="sm:hidden">URL</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-blue-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Library / Watch History & Saved Drawer Trigger */}
          <button
            onClick={onOpenHistoryModal}
            className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title={`Library (${historyCount} history, ${savedCount} saved)`}
            aria-label="Watch History and Saved Videos"
          >
            <History className="w-4 h-4" />
            {(savedCount > 0 || historyCount > 0) && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 ring-2 ring-white dark:ring-zinc-950"></span>
              </span>
            )}
          </button>

          {/* API Key Modal Trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className="relative flex items-center p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title={apiKeyValid ? 'API connected' : 'API key needed / demo mode'}
            aria-label="Configure API Key"
          >
            <Key className="w-4 h-4" />
            <span
              className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ring-2 ring-white dark:ring-zinc-950 ${
                apiKeyValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile search expanded form */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 animate-in fade-in duration-150">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Khmer songs, yearning, tech..."
                autoFocus
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-l-full py-1.5 pl-3.5 pr-8 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-l-0 border-zinc-300 dark:border-zinc-700 rounded-r-full px-3.5 py-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
