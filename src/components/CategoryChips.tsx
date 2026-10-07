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
  Compass
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
  { id: 'music', label: 'Music', query: 'official music video hits', icon: <Music className="w-3.5 h-3.5 text-pink-400" /> },
  { id: 'gaming', label: 'Gaming', query: 'gameplay walkthrough trailer', icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'tech', label: 'Tech & AI', query: 'tech artificial intelligence coding', icon: <Cpu className="w-3.5 h-3.5 text-sky-400" /> },
  { id: 'lofi', label: 'Lo-Fi Chill', query: 'lofi hip hop relaxing beats', icon: <Headphones className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'trailers', label: 'Movie Trailers', query: 'official movie trailer 4k', icon: <Film className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'news', label: 'News & World', query: 'world news report live', icon: <Newspaper className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'sports', label: 'Sports', query: 'sports highlights champions', icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
  { id: 'nature', label: 'Nature 4K', query: 'nature wildlife 4k hdr', icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" /> },
];

interface CategoryChipsProps {
  activeCategory: string;
  onSelectCategory: (category: CategoryOption) => void;
}

export const CategoryChips = ({
  activeCategory,
  onSelectCategory,
}: CategoryChipsProps) => {
  return (
    <div className="w-full bg-zinc-950/70 border-b border-zinc-800/60 sticky top-[61px] sm:top-[65px] z-30 py-2.5 px-3 sm:px-6 backdrop-blur-sm overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 shadow-md shadow-zinc-100/10 scale-102 font-semibold'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
