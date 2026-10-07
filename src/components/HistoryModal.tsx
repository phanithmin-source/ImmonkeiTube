import { useState } from 'react';
import { X, History, Bookmark, Trash2, Play, Video } from 'lucide-react';
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

  if (!isOpen) return null;

  const currentList = activeTab === 'history' ? history : saved;

  const handlePlay = (video: VideoItem) => {
    onPlayVideo(video);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-zinc-100">Library</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Watch History</span>
            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-300">
              {history.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watch Later</span>
            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-300">
              {saved.length}
            </span>
          </button>

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 pb-3 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <p className="text-sm font-medium">
                {activeTab === 'history' ? 'No watched videos yet.' : 'No saved videos yet.'}
              </p>
              <p className="text-xs">
                {activeTab === 'history'
                  ? 'Videos you play will show up here.'
                  : 'Click the bookmark icon on any video to watch later.'}
              </p>
            </div>
          ) : (
            currentList.map((video: VideoItem) => (
              <div
                key={video.id}
                className="group flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-zinc-800/60 transition-all"
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
                      video.thumbnails?.default?.url
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded">
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

                {/* Delete Item */}
                <button
                  onClick={() =>
                    activeTab === 'history'
                      ? onRemoveHistoryItem(video.id)
                      : onRemoveSavedItem(video.id)
                  }
                  className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Remove from list"
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
