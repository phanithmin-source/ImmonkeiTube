import { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const thumbnail = !imgError
    ? video.thumbnails?.maxres?.url ||
      video.thumbnails?.high?.url ||
      video.thumbnails?.medium?.url ||
      video.thumbnails?.default?.url
    : `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  const isLive = video.duration === 'Live' || video.duration === 'P0D' || video.duration === '';

  // Deterministic avatar gradient color based on channel name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-red-600 to-rose-700',
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-amber-600 to-orange-700',
      'from-rose-600 to-red-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      onClick={() => onSelect(video)}
      className="group flex flex-col bg-white dark:bg-zinc-900/50 hover:bg-zinc-50/90 dark:hover:bg-zinc-900/90 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <img
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-250"
          onError={() => {
            if (!imgError) {
              setImgError(true);
            }
          }}
        />

        {/* Cinematic Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-black/60 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration / LIVE Badge */}
        {video.duration && (
          <span
            className={`absolute bottom-2 right-2 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-md shadow-xs ${
              isLive
                ? 'bg-rose-600 text-white tracking-wider flex items-center gap-1.5 font-bold'
                : 'bg-black/80 text-white font-mono'
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

        {/* Bookmark Quick Action Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(video);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all duration-150 cursor-pointer ${
              isSaved
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
            }`}
            title={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
            aria-label={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Video Metadata Content */}
      <div className="p-3 flex gap-2.5 flex-1">
        {/* Channel Avatar Initial */}
        <div className="shrink-0 pt-0.5">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
              video.channelTitle || 'U'
            )} border border-white/20 flex items-center justify-center text-[11px] font-bold text-white shadow-xs`}
          >
            {video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {/* Title, Channel, Stats */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug transition-colors mb-1"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            <span className="truncate max-w-[170px]">{video.channelTitle}</span>
            <CheckCircle2 className="w-3 h-3 text-zinc-400 dark:text-zinc-500 fill-zinc-400 dark:fill-zinc-500 shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
            {video.viewCount && (
              <span>{formatViews(video.viewCount)}</span>
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
