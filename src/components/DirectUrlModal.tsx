import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Play, Link, AlertCircle, Sparkles } from 'lucide-react';
import { parseYouTubeVideoId } from '../services/youtubeApi';

interface DirectUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayVideoId: (videoId: string) => void;
}

const SAMPLE_VIDEOS = [
  { title: 'Rick Astley - Never Gonna Give You Up', id: 'dQw4w9WgXcQ' },
  { title: 'Lofi Girl - Relax / Study Beats (Live)', id: 'jfKfPfyJRdk' },
  { title: 'React in 100 Seconds', id: 'M576WGiDBdQ' },
  { title: 'Costa Rica in 4K 60fps HDR', id: 'LXb3EKWsInQ' },
  { title: 'ARC Raiders - Frozen Trail Trailer', id: 'KjiJDylLdZA' },
];

export const DirectUrlModal = ({
  isOpen,
  onClose,
  onPlayVideoId,
}: DirectUrlModalProps) => {
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setError('Please enter a YouTube link or video ID');
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

  const handlePickSample = (id: string) => {
    onPlayVideoId(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-zinc-100">Play Any YouTube Video</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                YouTube URL or 11-Character Video ID
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
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
              <span>Load & Play Video</span>
            </button>
          </form>

          {/* Quick Samples */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Samples:</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handlePickSample(sample.id)}
                  className="text-left px-3 py-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-300 hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <span className="truncate">{sample.title}</span>
                  <span className="text-[10px] text-zinc-500 group-hover:text-red-400 font-mono shrink-0 ml-2">
                    {sample.id}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
