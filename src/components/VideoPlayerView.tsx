import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import type { VideoItem, CommentItem } from '../types/youtube';
import { 
  formatViews, 
  formatLikes, 
  formatTimeAgo, 
  fetchVideoComments,
  fetchVideoDetails 
} from '../services/youtubeApi';

interface VideoPlayerViewProps {
  video: VideoItem;
  apiKey: string;
  onBack: () => void;
  onSelectRelated: (video: VideoItem) => void;
  relatedVideos: VideoItem[];
  isSaved: boolean;
  onToggleSave: (video: VideoItem) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const VideoPlayerView = ({
  video,
  apiKey,
  onBack,
  onSelectRelated,
  relatedVideos,
  isSaved,
  onToggleSave,
  onShowToast,
}: VideoPlayerViewProps) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isAmbientOn, setIsAmbientOn] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [currentVideoDetails, setCurrentVideoDetails] = useState<VideoItem>(video);

  // Keyboard shortcut: Esc to return to feed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeTag = (document.activeElement as HTMLElement)?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Scroll to top and reset interaction state when video changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentVideoDetails(video);
    setHasLiked(false);
    setHasDisliked(false);
  }, [video]);

  // Load detailed statistics and comments
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      // 1. Fetch fresh details if statistics are missing
      if (!video.viewCount && apiKey) {
        try {
          const detailed = await fetchVideoDetails(apiKey, video.id);
          if (!isCancelled) {
            setCurrentVideoDetails(detailed);
          }
        } catch (err) {
          console.warn('Could not load extra details for video', err);
        }
      }

      // 2. Fetch comments
      if (apiKey) {
        setLoadingComments(true);
        try {
          const fetchedComments = await fetchVideoComments(apiKey, video.id);
          if (!isCancelled) {
            setComments(fetchedComments);
          }
        } catch (err) {
          console.warn('Comments fetch error', err);
          if (!isCancelled) {
            setComments([]);
          }
        } finally {
          if (!isCancelled) {
            setLoadingComments(false);
          }
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [video.id, video.viewCount, apiKey]);

  const handleSubscribeToggle = () => {
    const next = !isSubscribed;
    setIsSubscribed(next);
    onShowToast(
      next ? `Subscribed to ${currentVideoDetails.channelTitle}!` : `Unsubscribed from ${currentVideoDetails.channelTitle}`,
      'success'
    );
  };

  const handleLikeToggle = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setHasDisliked(false);
      onShowToast('Added to Liked videos', 'success');
    } else {
      setHasLiked(false);
    }
  };

  const handleDislikeToggle = () => {
    if (!hasDisliked) {
      setHasDisliked(true);
      setHasLiked(false);
      onShowToast('Disliked video', 'info');
    } else {
      setHasDisliked(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      onShowToast('YouTube link copied to clipboard!', 'success');
    } else {
      onShowToast(`Share URL: ${shareUrl}`, 'info');
    }
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const userComment: CommentItem = {
      id: `local-${Date.now()}`,
      authorDisplayName: 'You (ImmonkeiTube Guest)',
      authorProfileImageUrl: '',
      textDisplay: newCommentText.trim(),
      publishedAt: new Date().toISOString(),
      likeCount: 0,
    };

    setComments([userComment, ...comments]);
    setNewCommentText('');
    onShowToast('Comment posted locally!', 'success');
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navigation Bar inside Player */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.08] transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
          <span>Back to Feed</span>
          <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/60 ml-1">
            Esc
          </kbd>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <button
            onClick={() => setIsAmbientOn(!isAmbientOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isAmbientOn 
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 border-zinc-800/80 bg-zinc-900/50'
            }`}
            title="Toggle Ambient Glow effect"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ambient Glow</span>
          </button>
          
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isTheaterMode 
                ? 'text-red-400 bg-red-500/10 border-red-500/30 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 border-zinc-800/80 bg-zinc-900/50'
            }`}
            title="Toggle Theater Mode"
          >
            {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTheaterMode ? 'Standard View' : 'Theater View'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={`max-w-7xl mx-auto px-4 ${isTheaterMode ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Left Column: Player + Metadata + Comments */}
        <div className={isTheaterMode ? 'w-full mb-8' : 'lg:col-span-2'}>
          {/* Responsive Video Player Container with Ambient Glow */}
          <div className="relative mb-4">
            {isAmbientOn && (
              <div 
                className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-purple-600/15 to-blue-600/20 rounded-3xl blur-2xl -z-10 opacity-70 transition-all duration-700 pointer-events-none"
              />
            )}
            
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/[0.08]">
              <iframe
                src={embedUrl}
                title={currentVideoDetails.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight leading-snug mb-3">
            {currentVideoDetails.title}
          </h1>

          {/* Channel Bar & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/[0.08] mb-4">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white text-base shadow-md">
                {currentVideoDetails.channelTitle ? currentVideoDetails.channelTitle.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-zinc-100 text-sm sm:text-base">
                  <span>{currentVideoDetails.channelTitle}</span>
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 fill-zinc-400" />
                </div>
                <span className="text-xs text-zinc-400">Verified Creator</span>
              </div>

              <button
                onClick={handleSubscribeToggle}
                className={`ml-3 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSubscribed
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-md shadow-zinc-100/10'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Like / Dislike Group */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors hover:bg-zinc-800 cursor-pointer ${
                    hasLiked ? 'text-red-400' : 'text-zinc-300'
                  }`}
                  title="Like video"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-red-400' : ''}`} />
                  <span>
                    {currentVideoDetails.likeCount
                      ? formatLikes(parseInt(currentVideoDetails.likeCount, 10) + (hasLiked ? 1 : 0))
                      : (hasLiked ? '1' : 'Like')}
                  </span>
                </button>
                <div className="w-[1px] h-4 bg-zinc-800" />
                <button
                  onClick={handleDislikeToggle}
                  className={`px-3 py-2 text-xs sm:text-sm transition-colors hover:bg-zinc-800 cursor-pointer ${
                    hasDisliked ? 'text-zinc-100' : 'text-zinc-400'
                  }`}
                  title="Dislike video"
                >
                  <ThumbsDown className={`w-4 h-4 ${hasDisliked ? 'fill-zinc-300' : ''}`} />
                </button>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm font-medium text-zinc-300 transition-colors cursor-pointer"
                title="Share video link"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Save / Watch Later */}
              <button
                onClick={() => onToggleSave(currentVideoDetails)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-red-600/10 border-red-500/40 text-red-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                }`}
                title={isSaved ? 'Saved to Watch Later' : 'Save to Watch Later'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-400' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Open in YouTube */}
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Open directly on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Expandable Description Box */}
          <div className="bg-zinc-900/60 hover:bg-zinc-900/80 border border-white/[0.08] rounded-2xl p-4 transition-colors mb-6 text-sm">
            <div className="flex flex-wrap items-center gap-3 font-semibold text-zinc-200 mb-2">
              <span>{formatViews(currentVideoDetails.viewCount)}</span>
              <span>•</span>
              <span>{formatTimeAgo(currentVideoDetails.publishedAt)}</span>
              {currentVideoDetails.tags && currentVideoDetails.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-auto">
                  {currentVideoDetails.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-red-400 hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`text-zinc-300 whitespace-pre-line leading-relaxed ${
                !isDescriptionExpanded ? 'line-clamp-3' : ''
              }`}
            >
              {currentVideoDetails.description || 'No description provided by the uploader.'}
            </div>

            {currentVideoDetails.description && currentVideoDetails.description.length > 180 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-3 text-xs font-bold text-zinc-200 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-white/[0.08] pt-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-zinc-100">
                Comments{' '}
                <span className="text-zinc-500 font-normal text-sm">
                  ({comments.length > 0 ? comments.length : (currentVideoDetails.commentCount ? parseInt(currentVideoDetails.commentCount, 10).toLocaleString() : '0')})
                </span>
              </h2>
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-sm shrink-0">
                You
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment on ImmonkeiTube..."
                  className="w-full bg-transparent border-b border-zinc-700 focus:border-red-500 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <div className="flex justify-end gap-2">
                  {newCommentText && (
                    <button
                      type="button"
                      onClick={() => setNewCommentText('')}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      newCommentText.trim()
                        ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md shadow-red-600/20'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-zinc-800 rounded" />
                      <div className="h-3 w-full bg-zinc-800/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/30 rounded-2xl border border-white/[0.06]">
                <p className="text-sm text-zinc-400">
                  Comments are disabled or none have been loaded yet for this video.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  You can type above to post a note locally!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-sm">
                    {comment.authorProfileImageUrl ? (
                      <img
                        src={comment.authorProfileImageUrl}
                        alt={comment.authorDisplayName}
                        className="w-9 h-9 rounded-full shrink-0 object-cover border border-zinc-800"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0">
                        {comment.authorDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-200 text-xs sm:text-sm">
                          {comment.authorDisplayName}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {formatTimeAgo(comment.publishedAt)}
                        </span>
                      </div>
                      <div
                        className="text-zinc-300 leading-relaxed text-xs sm:text-sm break-words"
                        dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                      />
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                        <button className="flex items-center gap-1 hover:text-zinc-200 transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
                        </button>
                        <button className="hover:text-zinc-200 transition-colors">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Up Next / Related Videos */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-1'}>
          <div className="sticky top-20 space-y-3">
            <h3 className="font-bold text-base text-zinc-200 px-1 flex items-center justify-between">
              <span>Up Next</span>
              <span className="text-xs font-normal text-zinc-400">Autoplay queue</span>
            </h3>

            <div className="space-y-3">
              {relatedVideos
                .filter((r) => r.id !== video.id)
                .slice(0, 10)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRelated(item)}
                    className="group flex gap-3 p-2 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800/80 transition-all cursor-pointer"
                  >
                    {/* Compact Thumbnail */}
                    <div className="relative w-36 aspect-video shrink-0 rounded-lg overflow-hidden bg-zinc-950">
                      <img
                        src={
                          item.thumbnails?.medium?.url ||
                          item.thumbnails?.high?.url ||
                          item.thumbnails?.default?.url
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/80 text-zinc-100 font-mono">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Compact Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-red-400 line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.channelTitle}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {formatViews(item.viewCount)} • {formatTimeAgo(item.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
