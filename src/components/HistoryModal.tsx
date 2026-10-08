import { useState, useEffect } from 'react';
import { X, History, Bookmark, Trash2, Play, Video, Search } from 'lucide-react';
import type { VideoItem } from '../types/youtube';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: VideoItem[];
  saved: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onRemoveHistoryItem: (videoId: string) => void;
  onClearHistory: () => void;
  onRemoveSavedItem: (videoId: string) => void;
}

export const HistoryModal = ({
  isOpen,
  onClose,
  history,
  saved,
  onPlayVideo,
  onRemoveHistoryItem,
  onClearHistory,
  onRemoveSavedItem,
}: HistoryModalProps) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const [searchFilter, setSearchFilter] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawList = activeTab === 'history' ? history : saved;
  const filteredList = searchFilter.trim()
    ? rawList.filter(
        (v) =>
          v.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          v.channelTitle?.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : rawList;

  const handlePlay = (video: VideoItem) => {
    onPlayVideo(video);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-100">Your Library</h3>
              <p className="text-[11px] text-zinc-400">
                Manage your watch history and bookmarked videos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Filter */}
        <div className="border-b border-white/[0.08] bg-zinc-950/40 px-6 pt-3 pb-2 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setActiveTab('history');
                setSearchFilter('');
              }}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Watch History</span>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300 font-mono">
                {history.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('saved');
                setSearchFilter('');
              }}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Watch Later</span>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300 font-mono">
                {saved.length}
              </span>
            </button>

            {activeTab === 'history' && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 pb-2 cursor-pointer transition-colors"
                title="Clear all watch history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Quick Filter Input */}
          {rawList.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Filter ${activeTab === 'history' ? 'history' : 'saved'} by title or channel...`}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-1.5 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
                {activeTab === 'history' ? (
                  <History className="w-6 h-6" />
                ) : (
                  <Bookmark className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-medium text-zinc-300">
                {searchFilter
                  ? 'No matches found.'
                  : activeTab === 'history'
                  ? 'No watch history yet.'
                  : 'No saved videos yet.'}
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {searchFilter
                  ? 'Try a different filter term.'
                  : activeTab === 'history'
                  ? 'Videos you play on ImmonkeiTube will appear here automatically.'
                  : 'Click the bookmark icon on any video card to save for later.'}
              </p>
            </div>
          ) : (
            filteredList.map((video: VideoItem) => (
              <div
                key={video.id}
                className="group flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-white/[0.04] hover:border-zinc-700/60 transition-all"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => handlePlay(video)}
                  className="relative w-28 aspect-video rounded-lg overflow-hidden bg-zinc-950 shrink-0 cursor-pointer"
                >
                  <img
                    src={
                      video.thumbnails?.medium?.url ||
                      video.thumbnails?.high?.url ||
                      video.thumbnails?.default?.url ||
                      `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded font-mono">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div
                  onClick={() => handlePlay(video)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-red-400 line-clamp-2 leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">
                    {video.channelTitle}
                  </p>
                </div>

                {/* Remove Item */}
                <button
                  onClick={() =>
                    activeTab === 'history'
                      ? onRemoveHistoryItem(video.id)
                      : onRemoveSavedItem(video.id)
                  }
                  className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Remove from list"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
