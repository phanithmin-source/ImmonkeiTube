import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CategoryChips } from './components/CategoryChips';
import { CATEGORIES } from './constants/categories';
import type { CategoryOption } from './constants/categories';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerView } from './components/VideoPlayerView';
import { DirectUrlModal } from './components/DirectUrlModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { HistoryModal } from './components/HistoryModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { VideoItem } from './types/youtube';
import { 
  getStoredApiKey, 
  fetchPopularVideos, 
  searchVideos, 
  fetchVideoDetails, 
  FALLBACK_VIDEOS 
} from './services/youtubeApi';
import { 
  AlertTriangle, 
  Flame, 
  Film,
  Sparkles,
  X,
  Play
} from 'lucide-react';

const HISTORY_STORAGE_KEY = 'immonkeitube_history_list';
const LEGACY_HISTORY_KEY = 'ustube_history_list';
const SAVED_STORAGE_KEY = 'immonkeitube_saved_list';
const LEGACY_SAVED_KEY = 'ustube_saved_list';
const HERO_DISMISSED_KEY = 'immonkeitube_hero_dismissed';
const THEME_STORAGE_KEY = 'immonkeitube_theme';

export function App() {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Dark / Light Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'dark'; // YouTube default experience
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      const meta = document.getElementById('theme-color-meta');
      if (meta) {
        meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#f8fafc');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  // Modals
  const [isDirectUrlModalOpen, setIsDirectUrlModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Hero banner state
  const [isHeroDismissed, setIsHeroDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HERO_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Notice banner state
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // Pagination / infinite scroll state
  const [visibleCount, setVisibleCount] = useState(16);

  // History & Saved state (with legacy key fallback)
  const [history, setHistory] = useState<VideoItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [saved, setSaved] = useState<VideoItem[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY) || localStorage.getItem(LEGACY_SAVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save history and saved to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.error(e);
    }
  }, [saved]);

  const handleDismissHero = () => {
    setIsHeroDismissed(true);
    try {
      localStorage.setItem(HERO_DISMISSED_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  // Infinite scroll listener: load next page of videos as user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        setVisibleCount((prev) => (prev < videos.length ? prev + 8 : prev));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [videos.length]);

  // Helper to filter fallback library by category or query
  const getFilteredFallback = (query?: string, category?: CategoryOption): VideoItem[] => {
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const filtered = FALLBACK_VIDEOS.filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
      return filtered.length > 0 ? filtered : FALLBACK_VIDEOS;
    }

    if (category && category.id !== 'all') {
      const catId = category.id.toLowerCase();
      const catQuery = (category.query || '').toLowerCase();
      const filtered = FALLBACK_VIDEOS.filter((v) => {
        const matchCat = v.tags?.some((t) => t.toLowerCase().includes(catId) || catQuery.includes(t.toLowerCase()));
        const matchTitle = v.title.toLowerCase().includes(catId) || v.title.toLowerCase().includes(catQuery);
        return matchCat || matchTitle;
      });
      return filtered.length > 0 ? filtered : FALLBACK_VIDEOS;
    }

    return FALLBACK_VIDEOS;
  };

  // Load videos based on category or search
  const loadVideos = useCallback(
    async (query?: string, category?: CategoryOption) => {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);

      try {
        let results: VideoItem[] = [];

        if (query && query.trim()) {
          results = await searchVideos(apiKey, query.trim());
        } else if (category && category.query) {
          results = await searchVideos(apiKey, category.query);
        } else {
          // Popular feed
          results = await fetchPopularVideos(apiKey);
        }

        if (results.length === 0) {
          setError('No videos found for this query. Displaying curated selection.');
          const fallbackResults = getFilteredFallback(query, category);
          setVideos(fallbackResults);
          setIsUsingFallback(true);
        } else {
          setVideos(results);
        }
      } catch (err: any) {
        console.error('Failed to load videos from API:', err);
        const errorMessage = err?.message || 'Error communicating with API';
        setError(errorMessage);

        // Fallback to offline curated list if quota exceeded or network blocked
        const fallbackResults = getFilteredFallback(query, category);
        setVideos(fallbackResults);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  // Initial load
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Handle Video Selection
  const handleSelectVideo = useCallback(
    (video: VideoItem) => {
      setCurrentVideo(video);

      // Add to watch history
      setHistory((prev) => {
        const filtered = prev.filter((v) => v.id !== video.id);
        return [video, ...filtered].slice(0, 50); // limit 50
      });
    },
    []
  );

  // Handle Play via Direct URL or ID
  const handlePlayVideoId = useCallback(
    async (videoId: string) => {
      setLoading(true);
      try {
        const videoDetails = await fetchVideoDetails(apiKey, videoId);
        handleSelectVideo(videoDetails);
        showToast(`Loaded: ${videoDetails.title}`, 'success');
      } catch {
        const fallbackItem: VideoItem = {
          id: videoId,
          title: `YouTube Video (${videoId})`,
          description: 'Loaded directly via YouTube ID.',
          channelTitle: 'YouTube',
          publishedAt: new Date().toISOString(),
          thumbnails: {
            high: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
            maxres: { url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` },
          },
        };
        handleSelectVideo(fallbackItem);
        showToast(`Loaded video ID: ${videoId}`, 'info');
      } finally {
        setLoading(false);
      }
    },
    [apiKey, handleSelectVideo, showToast]
  );

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(16);
    setCurrentVideo(null); // return to feed to view search results
    loadVideos(query, undefined);
  };

  // Category handler
  const handleSelectCategory = (category: CategoryOption) => {
    setActiveCategory(category);
    setSearchQuery('');
    setVisibleCount(16);
    setCurrentVideo(null);
    loadVideos(undefined, category);
  };

  // Toggle Save to Watch Later
  const handleToggleSave = useCallback(
    (video: VideoItem) => {
      const isAlreadySaved = saved.some((s) => s.id === video.id);
      if (isAlreadySaved) {
        setSaved((prev) => prev.filter((s) => s.id !== video.id));
        showToast('Removed from Watch Later', 'info');
      } else {
        setSaved((prev) => [video, ...prev]);
        showToast('Saved to Watch Later', 'success');
      }
    },
    [saved, showToast]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-150">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Main Header */}
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onHomeClick={() => {
          setCurrentVideo(null);
          setSearchQuery('');
          setActiveCategory(CATEGORIES[0]);
          setVisibleCount(16);
          loadVideos(undefined, CATEGORIES[0]);
        }}
        onOpenDirectUrl={() => setIsDirectUrlModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        savedCount={saved.length}
        historyCount={history.length}
        apiKeyValid={!isUsingFallback && !error}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Body */}
      {currentVideo ? (
        // Active Player View
        <main className="flex-1">
          <VideoPlayerView
            video={currentVideo}
            apiKey={apiKey}
            onBack={() => setCurrentVideo(null)}
            onSelectRelated={handleSelectVideo}
            relatedVideos={videos}
            isSaved={saved.some((s) => s.id === currentVideo.id)}
            onToggleSave={handleToggleSave}
            onShowToast={showToast}
          />
        </main>
      ) : (
        // Video Discovery Feed View
        <main className="flex-1 flex flex-col">
          {/* Category Chips Bar */}
          <CategoryChips
            activeCategory={activeCategory.id}
            onSelectCategory={handleSelectCategory}
          />

          <div className="max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-5 w-full flex-1">
            {/* Hero Welcome Spotlight (Shows only on All tab when not searching and not dismissed) */}
            {!searchQuery && activeCategory.id === 'all' && !isHeroDismissed && (
              <div className="relative mb-4 sm:mb-5 rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-gradient-to-r from-blue-500/5 via-white to-zinc-50 dark:from-blue-950/25 dark:via-zinc-900/80 dark:to-zinc-950 p-3.5 sm:p-4.5 overflow-hidden shadow-xs transition-colors">
                {/* Ambient glow decoration */}
                <div className="absolute -top-16 -right-16 w-60 h-60 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4">
                  {/* Left: Branding & Message */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <img
                      src="/assets/immonkeitube-logo.png"
                      alt="ImmonkeiTube Mascot"
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-xs"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                          Welcome to Immonkei<span className="text-blue-600 dark:text-blue-500">Tube</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
                        Curated stream for <strong>Khmer Songs</strong>, <strong>Yearning Ballads</strong>, and <strong>Tech & AI</strong> with continuous autoplay and custom Google API key connectivity.
                      </p>
                      
                      {/* Feature Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-white/[0.06]">
                          🎵 Khmer Songs
                        </span>
                        <span className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-white/[0.06]">
                          🎧 Yearning Ballads
                        </span>
                        <span className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-white/[0.06]">
                          💻 Tech & AI
                        </span>
                        <span className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-white/[0.06]">
                          ⚡ Autoplay Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Launch & Dismiss */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setIsDirectUrlModalOpen(true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play Video URL</span>
                    </button>
                    <button
                      onClick={handleDismissHero}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Dismiss welcome banner"
                      aria-label="Dismiss banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Notice / Quota Banner */}
            {isUsingFallback && !isNoticeDismissed && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-amber-900 dark:text-amber-200">
                <div className="flex items-start sm:items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 dark:text-amber-100">
                      Notice:
                    </span>{' '}
                    {error || 'Displaying curated library. Connect your own Google API key for unrestricted catalog access.'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Configure Key
                  </button>
                  <button
                    onClick={() => loadVideos(searchQuery, activeCategory)}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => setIsNoticeDismissed(true)}
                    className="p-1 text-amber-600 hover:text-amber-900 dark:text-amber-300 dark:hover:text-white rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                    title="Dismiss notice"
                    aria-label="Dismiss notice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Feed Section Title */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                {activeCategory.id === 'trending' ? (
                  <Flame className="w-4 h-4 text-orange-500" />
                ) : (
                  <Film className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                )}
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : activeCategory.id === 'all'
                    ? 'Recommended for You'
                    : `${activeCategory.label} Videos`}
                </h2>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {videos.length} videos available
              </span>
            </div>

            {/* Video Cards Grid */}
            {loading ? (
              // Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-zinc-900/40 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-white/[0.04] overflow-hidden animate-pulse flex flex-col"
                  >
                    <div className="aspect-video bg-zinc-200 dark:bg-zinc-800/60 w-full" />
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                          <div className="h-2.5 bg-zinc-200/70 dark:bg-zinc-800/60 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="h-2.5 bg-zinc-200/60 dark:bg-zinc-800/40 rounded w-1/3 ml-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center mx-auto overflow-hidden shadow-sm">
                  <img
                    src="/assets/immonkeitube-logo.png"
                    alt="ImmonkeiTube"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  No videos found
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Try searching for another keyword or select one of the categories above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(CATEGORIES[0]);
                    loadVideos(undefined, CATEGORIES[0]);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Reset Feed
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
                  {videos.slice(0, visibleCount).map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={handleSelectVideo}
                      isSaved={saved.some((s) => s.id === video.id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>

                {visibleCount < videos.length && (
                  <div className="pt-6 pb-2 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08] transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                    >
                      Load More Videos ({videos.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 py-4 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <img
              src="/assets/immonkeitube-logo.png"
              alt="ImmonkeiTube"
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain shrink-0"
            />
            <span className="font-bold text-zinc-800 dark:text-zinc-300">
              Immonkei<span className="text-blue-600 dark:text-blue-500">Tube</span>
            </span>
            <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">•</span>
            <a
              href="https://devfolio-immonkei.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-white transition-all group font-medium text-[11px] shadow-2xs"
              title="Visit Developer Portfolio"
            >
              <Sparkles className="w-2.5 h-2.5 text-blue-600 group-hover:rotate-12 transition-transform" />
              <span>By <strong className="text-zinc-900 dark:text-white group-hover:text-blue-600 font-semibold">Immonkei</strong></span>
            </a>
          </div>

          {/* Keyboard shortcut tips */}
          <div className="hidden md:flex items-center gap-2.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>
              <kbd className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">/</kbd> search
            </span>
            <span>•</span>
            <span>
              <kbd className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">Esc</kbd> exit player
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <button
              onClick={() => setIsDirectUrlModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Play URL
            </button>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              API Key
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Library
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DirectUrlModal
        isOpen={isDirectUrlModalOpen}
        onClose={() => setIsDirectUrlModalOpen(false)}
        onPlayVideoId={handlePlayVideoId}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentApiKey={apiKey}
        onApiKeyUpdated={(newKey) => {
          setApiKey(newKey);
          loadVideos(searchQuery, activeCategory);
        }}
        onShowToast={showToast}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        saved={saved}
        onPlayVideo={handleSelectVideo}
        onRemoveHistoryItem={(id: string) => {
          setHistory((prev) => prev.filter((v) => v.id !== id));
          showToast('Removed from history', 'info');
        }}
        onClearHistory={() => {
          setHistory([]);
          showToast('Watch history cleared', 'info');
        }}
        onRemoveSavedItem={(id: string) => {
          setSaved((prev) => prev.filter((v) => v.id !== id));
          showToast('Removed from Watch Later', 'info');
        }}
      />
    </div>
  );
}

export default App;
