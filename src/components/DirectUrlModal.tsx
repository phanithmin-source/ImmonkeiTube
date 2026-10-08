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
  { title: 'Costa Rica in 4K 60fps HDR (Nature & Wildlife)', id: 'LXb3EKWsInQ', tag: '4K Ultra HD' },
  { title: 'Lofi Girl - Relax / Study Beats (Live Stream)', id: 'jfKfPfyJRdk', tag: 'Lo-Fi Chill' },
  { title: 'ARC Raiders - Official Gameplay Trailer', id: 'KjiJDylLdZA', tag: 'Gaming' },
  { title: 'React in 100 Seconds - Fireship', id: 'M576WGiDBdQ', tag: 'Tech' },
  { title: 'Rick Astley - Never Gonna Give You Up', id: 'dQw4w9WgXcQ', tag: 'Music' },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-100">
                Play Any YouTube Video
              </h3>
              <p className="text-[11px] text-zinc-400">
                Stream any video, Shorts, live stream, or video ID directly
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

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  YouTube URL or Video ID
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste from Clipboard</span>
                </button>
              </div>

              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Load & Stream Now</span>
            </button>
          </form>

          {/* Quick Test Samples */}
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Samples:</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handlePickSample(sample.id)}
                  className="text-left px-3 py-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 border border-white/[0.06] hover:border-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{sample.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                      {sample.tag}
                    </span>
                    <span className="text-[10px] text-zinc-500 group-hover:text-red-400 font-mono">
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
