import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X, Play, Link, AlertCircle, Sparkles, ClipboardPaste } from 'lucide-react';
import { parseYouTubeVideoId } from '../services/youtubeApi';

interface DirectUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayVideoId: (videoId: string) => void;
}

const SAMPLE_VIDEOS = [
  { title: 'VannDa - Time To Rise ft. Master Kong Nay', id: '1g_O_7f_0u0', tag: 'Khmer Song' },
  { title: 'Stephen Sanchez - Until I Found You', id: 'GxldQ9GyXfY', tag: 'Yearning' },
  { title: 'Conan Gray - Heather (Official Video)', id: '2fZk_fJqX_A', tag: 'Yearning' },
  { title: 'React in 100 Seconds - Fireship', id: 'M576WGiDBdQ', tag: 'Tech' },
  { title: 'Build Full Stack AI App - JS Mastery', id: '7nosL3sHq0Q', tag: 'Tech' },
];

export const DirectUrlModal = ({
  isOpen,
  onClose,
  onPlayVideoId,
}: DirectUrlModalProps) => {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setError('Please enter a YouTube link or 11-character video ID');
      return;
    }

    const videoId = parseYouTubeVideoId(inputUrl.trim());
    if (!videoId) {
      setError('Invalid YouTube link or ID format. Try pasting https://www.youtube.com/watch?v=... or an 11-character ID.');
      return;
    }

    setError('');
    onPlayVideoId(videoId);
    onClose();
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          setError('');
        }
      }
    } catch {
      // Clipboard access might require user permission
    }
  };

  const handlePickSample = (id: string) => {
    onPlayVideoId(id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Play Any YouTube Video
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Stream any video, Shorts, live stream, or ID directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  YouTube URL or Video ID
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              </div>

              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=1g_O_7f_0u0"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all shadow-inner"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-1.5 text-rose-500 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-blue-600/20 hover:scale-[1.01]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Load & Stream Now</span>
            </button>
          </form>

          {/* Quick Test Samples */}
          <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Featured Samples (Khmer • Yearning • Tech):</span>
            </div>
            <div className="flex flex-col gap-1">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handlePickSample(sample.id)}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.06] text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <span className="truncate pr-2">{sample.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                      {sample.tag}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-mono">
                      {sample.id}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
