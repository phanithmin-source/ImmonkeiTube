import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import type { CategoryOption } from '../constants/categories';

interface CategoryChipsProps {
  activeCategory: string;
  onSelectCategory: (category: CategoryOption) => void;
}

export const CategoryChips = ({
  activeCategory,
  onSelectCategory,
}: CategoryChipsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-zinc-950/80 border-b border-white/[0.06] sticky top-[61px] sm:top-[65px] z-30 py-2.5 px-3 sm:px-6 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left scroll nudge button for desktop */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-3 z-10 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-md text-zinc-300 hover:text-white hover:bg-zinc-800 items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable chip container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm shadow-white/10 font-semibold scale-[1.02]'
                    : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/[0.08] hover:border-zinc-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right scroll nudge button for desktop */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute -right-3 z-10 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-md text-zinc-300 hover:text-white hover:bg-zinc-800 items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
