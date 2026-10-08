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
  Link as LinkIcon,
  X,
  Play
} from 'lucide-react';

const HISTORY_STORAGE_KEY = 'immonkeitube_history_list';
const LEGACY_HISTORY_KEY = 'ustube_history_list';
const SAVED_STORAGE_KEY = 'immonkeitube_saved_list';
const LEGACY_SAVED_KEY = 'ustube_saved_list';
const HERO_DISMISSED_KEY = 'immonkeitube_hero_dismissed';

export function App() {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

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
          setError('No videos found for this query. Try another keyword or category.');
        } else {
          setVideos(results);
        }
      } catch (err: any) {
        console.error('Failed to load videos from YouTube API:', err);
        const errorMessage = err?.message || 'Error communicating with YouTube API';
        setError(errorMessage);

        // Fallback to offline curated list if quota exceeded or network blocked
        setVideos(FALLBACK_VIDEOS);
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
        // Try fetching actual metadata from API
        const videoDetails = await fetchVideoDetails(apiKey, videoId);
        handleSelectVideo(videoDetails);
        showToast(`Loaded: ${videoDetails.title}`, 'success');
      } catch {
        // If API fails or video is private, still create playable item
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
    setCurrentVideo(null); // return to feed to view search results
    loadVideos(query, undefined);
  };

  // Category handler
  const handleSelectCategory = (category: CategoryOption) => {
    setActiveCategory(category);
    setSearchQuery('');
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
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
          loadVideos(undefined, CATEGORIES[0]);
        }}
        onOpenDirectUrl={() => setIsDirectUrlModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        savedCount={saved.length}
        historyCount={history.length}
        apiKeyValid={!isUsingFallback && !error}
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
            {/* Hero Welcome Spotlight (Shows only on All tab when not searching and not dismissed) */}
            {!searchQuery && activeCategory.id === 'all' && !isHeroDismissed && (
              <div className="relative mb-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 sm:p-8 overflow-hidden shadow-xl">
                {/* Background ambient decorative glow */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left: Branding & Message */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-red-500/30 p-1 shadow-lg shadow-red-600/20 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src="/assets/immonkeitube-logo.webp"
                        alt="ImmonkeiTube Mascot"
                        className="w-full h-full object-contain scale-125"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          Welcome to Immonkei<span className="text-red-500">Tube</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                          v3 API
                        </span>
                        <a
                          href="https://immonkei.dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/90 hover:bg-zinc-800 border border-white/[0.1] text-zinc-300 hover:text-white transition-all text-[11px] font-medium group"
                          title="Prompted by Immonkei.dev"
                        >
                          <Sparkles className="w-3 h-3 text-red-400 group-hover:rotate-12 transition-transform" />
                          <span>Prompted by <strong className="text-red-400 group-hover:text-red-300 font-semibold">Immonkei.dev</strong></span>
                        </a>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                        High-performance YouTube player featuring direct video URL streaming, ambient cinema glow, category discovery, and custom Google API key connectivity.
                      </p>
                      
                      {/* Feature Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-white/[0.06]">
                          <Sparkles className="w-3 h-3 text-amber-400" /> 4K Ultra HD
                        </span>
                        <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-white/[0.06]">
                          <LinkIcon className="w-3 h-3 text-red-400" /> Direct ID / Link
                        </span>
                        <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-white/[0.06]">
                          ⚡ Zero Lag
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Launch & Dismiss */}
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setIsDirectUrlModalOpen(true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md shadow-red-600/25 hover:scale-[1.02]"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Any Video URL</span>
                    </button>
                    <button
                      onClick={handleDismissHero}
                      className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
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
            {isUsingFallback && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-amber-100">
                      YouTube API Notice:
                    </span>{' '}
                    {error || 'Displaying curated library. Connect your own Google API key for unrestricted catalog access.'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    Configure Key
                  </button>
                  <button
                    onClick={() => loadVideos(searchQuery, activeCategory)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer border border-zinc-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Feed Section Title */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {activeCategory.id === 'trending' ? (
                  <Flame className="w-5 h-5 text-orange-500" />
                ) : (
                  <Film className="w-5 h-5 text-red-500" />
                )}
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : activeCategory.id === 'all'
                    ? 'Recommended for You'
                    : `${activeCategory.label} Videos`}
                </h2>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {videos.length} videos available
              </span>
            </div>

            {/* Video Cards Grid */}
            {loading ? (
              // Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/40 rounded-2xl border border-white/[0.04] overflow-hidden animate-pulse flex flex-col"
                  >
                    <div className="aspect-video bg-zinc-800/60 w-full" />
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-zinc-800 rounded w-full" />
                          <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="h-3 bg-zinc-800/40 rounded w-1/3 ml-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center mx-auto overflow-hidden shadow-lg">
                  <img
                    src="/assets/immonkeitube-logo.webp"
                    alt="ImmonkeiTube"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="text-base font-semibold text-zinc-200">
                  No videos found
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Try searching for another keyword or pick one of the category chips above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(CATEGORIES[0]);
                    loadVideos(undefined, CATEGORIES[0]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-md shadow-red-600/20"
                >
                  Reset Feed
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={handleSelectVideo}
                    isSaved={saved.some((s) => s.id === video.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-red-500/30 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/immonkeitube-logo.webp"
                alt="ImmonkeiTube"
                className="w-full h-full object-contain scale-125"
              />
            </div>
            <span className="font-bold text-zinc-300">
              Immonkei<span className="text-red-500">Tube</span>
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span>Powered by Google YouTube Data API v3</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <a
              href="https://immonkei.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 hover:text-white transition-all group font-medium shadow-sm hover:scale-[1.02]"
              title="Prompted by Immonkei.dev"
            >
              <Sparkles className="w-3 h-3 text-red-400 group-hover:rotate-12 transition-transform" />
              <span>Prompted by <strong className="text-white group-hover:text-red-300">Immonkei.dev</strong></span>
            </a>
          </div>

          {/* Keyboard shortcut tips */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-500">
            <span>
              Press <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">/</kbd> to search
            </span>
            <span>•</span>
            <span>
              Press <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">Esc</kbd> to exit player
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsDirectUrlModalOpen(true)}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Play URL / ID
            </button>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              API Key Config
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Library & History
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
