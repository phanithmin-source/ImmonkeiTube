import type { ReactNode } from 'react';
import { 
  Flame, 
  Music, 
  Gamepad2, 
  Cpu, 
  Newspaper, 
  Headphones, 
  Film, 
  Sparkles, 
  Trophy, 
  Compass,
  Radio,
  Tv
} from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  query?: string;
  icon?: ReactNode;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
  { id: 'music', label: 'Music', query: 'official music video hits 4k', icon: <Music className="w-3.5 h-3.5 text-pink-400" /> },
  { id: 'gaming', label: 'Gaming', query: 'gameplay walkthrough trailer 60fps', icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'tech', label: 'Tech & AI', query: 'artificial intelligence tech review', icon: <Cpu className="w-3.5 h-3.5 text-sky-400" /> },
  { id: 'lofi', label: 'Lo-Fi Chill', query: 'lofi hip hop relaxing study beats', icon: <Headphones className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'live', label: 'Live Streams', query: 'live stream broadcasting now', icon: <Radio className="w-3.5 h-3.5 text-red-500" /> },
  { id: 'trailers', label: 'Trailers & Cinema', query: 'official movie trailer 4k', icon: <Film className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'shows', label: 'Podcasts & Shows', query: 'popular podcast episode talk show', icon: <Tv className="w-3.5 h-3.5 text-indigo-400" /> },
  { id: 'news', label: 'World News', query: 'global news broadcast breaking', icon: <Newspaper className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'sports', label: 'Sports', query: 'sports highlights champions hd', icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
  { id: 'nature', label: 'Nature 4K', query: 'nature documentary 4k hdr 60fps', icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" /> },
];
