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
      className="group flex flex-col bg-zinc-900/40 hover:bg-zinc-900/80 rounded-2xl overflow-hidden border border-white/[0.06] hover:border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-red-950/10 hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={() => {
            if (!imgError) {
              setImgError(true);
            }
          }}
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-black/60 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration / LIVE Badge */}
        {video.duration && (
          <span
            className={`absolute bottom-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-md shadow-md ${
              isLive
                ? 'bg-red-600 text-white tracking-wider flex items-center gap-1.5'
                : 'bg-black/80 text-zinc-100 font-mono text-[11px]'
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
            className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/85 opacity-0 group-hover:opacity-100'
            }`}
            title={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
            aria-label={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Video Metadata Content */}
      <div className="p-3.5 flex gap-3 flex-1">
        {/* Channel Avatar Initial */}
        <div className="shrink-0 pt-0.5">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(
              video.channelTitle || 'U'
            )} border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm`}
          >
            {video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        {/* Title, Channel, Stats */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-zinc-100 group-hover:text-red-400 line-clamp-2 leading-snug transition-colors mb-1.5"
            title={video.title}
          >
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
            <span className="truncate max-w-[180px]">{video.channelTitle}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500 shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
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
