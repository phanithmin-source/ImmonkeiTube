import { Play, CheckCircle2, Bookmark } from 'lucide-react';
import type { VideoItem } from '../types/youtube';
import { formatViews, formatTimeAgo } from '../services/youtubeApi';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isSaved?: boolean;
  onToggleSave?: (video: VideoItem) => void;
}

export const VideoCard = ({
  video,
  onSelect,
  isSaved = false,
  onToggleSave,
}: VideoCardProps) => {
  const thumbnail =
    video.thumbnails?.maxres?.url ||
    video.thumbnails?.high?.url ||
    video.thumbnails?.medium?.url ||
    video.thumbnails?.default?.url ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  const isLive = video.duration === 'Live' || video.duration === 'P0D' || video.duration === '';

  return (
    <div
      onClick={() => onSelect(video)}
      className="group flex flex-col bg-zinc-900/40 hover:bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-red-950/10 hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback if maxres is missing
            const target = e.currentTarget;
            if (video.thumbnails?.high?.url && target.src !== video.thumbnails.high.url) {
              target.src = video.thumbnails.high.url;
            } else if (video.thumbnails?.medium?.url && target.src !== video.thumbnails.medium.url) {
              target.src = video.thumbnails.medium.url;
            }
          }}
        />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-black/50 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration / LIVE Badge */}
        {video.duration && (
          <span
            className={`absolute bottom-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-md shadow-md ${
              isLive
                ? 'bg-red-600 text-white tracking-wider flex items-center gap-1'
                : 'bg-black/80 text-zinc-100'
            }`}
          >
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </>
            ) : (
              video.duration
            )}
          </span>
        )}

        {/* Bookmark Quick Action */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(video);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save to Watch Later'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Video Info Content */}
      <div className="p-3.5 flex gap-3 flex-1">
        {/* Channel Avatar Placeholder or Initials */}
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 shadow-sm">
            {video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-zinc-100 group-hover:text-red-400 line-clamp-2 leading-snug transition-colors mb-1"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            <span className="truncate max-w-[180px]">{video.channelTitle}</span>
            <CheckCircle2 className="w-3 h-3 text-zinc-500 fill-zinc-500 shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            {video.viewCount && (
              <span className="flex items-center gap-1">
                <span>{formatViews(video.viewCount)}</span>
              </span>
            )}
            {video.viewCount && video.publishedAt && <span>•</span>}
            {video.publishedAt && (
              <span>{formatTimeAgo(video.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
