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
  Sparkles,
  PlayCircle,
  SkipForward
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

const AUTOPLAY_STORAGE_KEY = 'immonkeitube_autoplay';

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

  // Autoplay state (enabled by default)
  const [isAutoplayOn, setIsAutoplayOn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleAutoplay = () => {
    setIsAutoplayOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUTOPLAY_STORAGE_KEY, String(next));
      } catch {}
      onShowToast(`Autoplay ${next ? 'enabled' : 'disabled'}`, 'info');
      return next;
    });
  };

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [currentVideoDetails, setCurrentVideoDetails] = useState<VideoItem>(video);
  const [prevVideoId, setPrevVideoId] = useState(video.id);

  if (video.id !== prevVideoId) {
    setPrevVideoId(video.id);
    setCurrentVideoDetails(video);
    setHasLiked(false);
    setHasDisliked(false);
  }

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

  // Scroll to top when video changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [video.id]);

  // Next video in queue
  const nextVideo = relatedVideos.find((r) => r.id !== video.id) || relatedVideos[0];

  const handlePlayNext = () => {
    if (nextVideo) {
      onSelectRelated(nextVideo);
      onShowToast(`Playing next: ${nextVideo.title}`, 'info');
    }
  };

  // Autoplay listener for YouTube Iframe onStateChange=0 (ENDED)
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          if (isAutoplayOn && nextVideo) {
            onShowToast(`Autoplaying next: ${nextVideo.title}`, 'info');
            onSelectRelated(nextVideo);
          }
        }
      } catch {
        // Ignore non-json window messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [isAutoplayOn, nextVideo, onSelectRelated, onShowToast]);

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

  const originParam = typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1${originParam}`;

  return (
    <div className="min-h-screen pb-14">
      {/* Top Navigation Bar inside Player */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>Back to Feed</span>
          <kbd className="hidden sm:inline text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60 ml-0.5">
            Esc
          </kbd>
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          {/* Autoplay Toggle Button */}
          <button
            onClick={handleToggleAutoplay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isAutoplayOn 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-2xs' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
            }`}
            title="Autoplay next video when current video finishes"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Autoplay: <strong className={isAutoplayOn ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'}>{isAutoplayOn ? 'ON' : 'OFF'}</strong></span>
          </button>

          {/* Skip to Next Video */}
          {nextVideo && (
            <button
              onClick={handlePlayNext}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
              title={`Play next: ${nextVideo.title}`}
            >
              <SkipForward className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Next</span>
            </button>
          )}

          {/* Ambient Glow Toggle */}
          <button
            onClick={() => setIsAmbientOn(!isAmbientOn)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isAmbientOn 
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-2xs' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
            }`}
            title="Toggle Ambient Cinema Glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Glow</span>
          </button>
          
          {/* Theater View Toggle */}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isTheaterMode 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-2xs' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
            }`}
            title="Toggle Theater Mode"
          >
            {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTheaterMode ? 'Standard' : 'Theater'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-5 ${isTheaterMode ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-5'}`}>
        {/* Left Column: Player + Metadata + Comments */}
        <div className={isTheaterMode ? 'w-full mb-6' : 'lg:col-span-2'}>
          {/* Responsive Video Player Container with Ambient Glow */}
          <div className="relative mb-3.5">
            {isAmbientOn && (
              <div 
                className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-cyan-600/20 rounded-3xl blur-xl -z-10 opacity-70 transition-all duration-500 pointer-events-none"
              />
            )}
            
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-xl border border-zinc-200/80 dark:border-white/[0.08]">
              <iframe
                id="youtube-player-iframe"
                src={embedUrl}
                title={currentVideoDetails.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Title */}
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug mb-2.5">
            {currentVideoDetails.title}
          </h1>

          {/* Channel Bar & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-zinc-200/80 dark:border-white/[0.08] mb-3.5">
            {/* Channel Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-2xs shrink-0">
                {currentVideoDetails.channelTitle ? currentVideoDetails.channelTitle.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                  <span>{currentVideoDetails.channelTitle}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Creator</span>
              </div>

              <button
                onClick={handleSubscribeToggle}
                className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSubscribed
                    ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xs'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
              {/* Like / Dislike Group */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden shadow-2xs">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-800 cursor-pointer ${
                    hasLiked ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                  title="Like video"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                  <span>
                    {currentVideoDetails.likeCount
                      ? formatLikes(parseInt(currentVideoDetails.likeCount, 10) + (hasLiked ? 1 : 0))
                      : (hasLiked ? '1' : 'Like')}
                  </span>
                </button>
                <div className="w-[1px] h-3.5 bg-zinc-300 dark:bg-zinc-800" />
                <button
                  onClick={handleDislikeToggle}
                  className={`px-2.5 py-1.5 text-xs transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-800 cursor-pointer ${
                    hasDisliked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                  title="Dislike video"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-zinc-700 dark:fill-zinc-300' : ''}`} />
                </button>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                title="Share video link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Save / Watch Later */}
              <button
                onClick={() => onToggleSave(currentVideoDetails)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                  isSaved
                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
                title={isSaved ? 'Saved to Watch Later' : 'Save to Watch Later'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Open in YouTube */}
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors shadow-2xs"
                title="Open directly on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Expandable Description Box */}
          <div className="bg-zinc-100/80 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80 border border-zinc-200/90 dark:border-white/[0.08] rounded-xl p-3 sm:p-3.5 transition-colors mb-5 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              <span>{formatViews(currentVideoDetails.viewCount)}</span>
              <span>•</span>
              <span>{formatTimeAgo(currentVideoDetails.publishedAt)}</span>
              {currentVideoDetails.tags && currentVideoDetails.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-auto">
                  {currentVideoDetails.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed ${
                !isDescriptionExpanded ? 'line-clamp-3' : ''
              }`}
            >
              {currentVideoDetails.description || 'No description provided by the uploader.'}
            </div>

            {currentVideoDetails.description && currentVideoDetails.description.length > 160 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-[11px] font-bold text-zinc-900 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-white uppercase tracking-wider cursor-pointer"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-zinc-200/80 dark:border-white/[0.08] pt-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Comments{' '}
                <span className="text-zinc-500 font-normal text-xs">
                  ({comments.length > 0 ? comments.length : (currentVideoDetails.commentCount ? parseInt(currentVideoDetails.commentCount, 10).toLocaleString() : '0')})
                </span>
              </h2>
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 text-xs shrink-0">
                You
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment on ImmonkeiTube..."
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-blue-600 py-1 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <div className="flex justify-end gap-2">
                  {newCommentText && (
                    <button
                      type="button"
                      onClick={() => setNewCommentText('')}
                      className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      newCommentText.trim()
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      <div className="h-3 w-full bg-zinc-200/70 dark:bg-zinc-800/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="p-6 text-center bg-zinc-100/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/80 dark:border-white/[0.06]">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Comments are disabled or none have been loaded yet for this video.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  You can type above to post a note locally!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-xs sm:text-sm">
                    {comment.authorProfileImageUrl ? (
                      <img
                        src={comment.authorProfileImageUrl}
                        alt={comment.authorDisplayName}
                        className="w-8 h-8 rounded-full shrink-0 object-cover border border-zinc-200 dark:border-zinc-800"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
                        {comment.authorDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs sm:text-sm">
                          {comment.authorDisplayName}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatTimeAgo(comment.publishedAt)}
                        </span>
                      </div>
                      <div
                        className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm break-words"
                        dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                      />
                      <div className="flex items-center gap-2.5 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
                        </button>
                        <button className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                          <ThumbsDown className="w-3 h-3" />
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
          <div className="sticky top-16 space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                Up Next
              </h3>
              <button
                onClick={handleToggleAutoplay}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Toggle continuous autoplay"
              >
                <span>Autoplay</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isAutoplayOn ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                  {isAutoplayOn ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="space-y-2">
              {relatedVideos
                .filter((r) => r.id !== video.id)
                .slice(0, 10)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRelated(item)}
                    className="group flex gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100/90 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800/80 transition-all cursor-pointer"
                  >
                    {/* Compact Thumbnail */}
                    <div className="relative w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                      <img
                        src={
                          item.thumbnails?.medium?.url ||
                          item.thumbnails?.high?.url ||
                          item.thumbnails?.default?.url
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform"
                      />
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 text-[9px] font-semibold px-1 py-0.2 rounded bg-black/80 text-white font-mono">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Compact Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {item.channelTitle}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
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
