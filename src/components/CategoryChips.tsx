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
      const offset = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-white/[0.06] sticky top-[49px] sm:top-[53px] z-30 py-1.5 px-3 sm:px-5 backdrop-blur-xl transition-colors duration-150">
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left scroll nudge button for desktop */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-2 z-10 w-6.5 h-6.5 rounded-full bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 shadow-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 items-center justify-center transition-all cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable chip container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs font-semibold'
                    : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200/90 dark:border-white/[0.08]'
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
          className="hidden md:flex absolute -right-2 z-10 w-6.5 h-6.5 rounded-full bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 shadow-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 items-center justify-center transition-all cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
