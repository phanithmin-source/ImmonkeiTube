import type { ReactNode } from 'react';
import { 
  Music, 
  Cpu, 
  Headphones, 
  Sparkles, 
  Compass, 
  Radio, 
  Heart,
  Code2,
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
  { id: 'khmer_songs', label: 'Khmer Songs', query: 'khmer songs official mv original audio', icon: <Music className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'yearning_songs', label: 'Yearning Songs', query: 'yearning songs nostalgic emotional acoustic ballad', icon: <Heart className="w-3.5 h-3.5 text-indigo-400" /> },
  { id: 'tech_coding', label: 'Tech & Coding', query: 'programming coding software development tech review', icon: <Cpu className="w-3.5 h-3.5 text-sky-400" /> },
  { id: 'khmer_acoustic', label: 'Khmer Chill', query: 'khmer acoustic chill songs guitar cover', icon: <Headphones className="w-3.5 h-3.5 text-teal-400" /> },
  { id: 'ai_future', label: 'AI & Engineering', query: 'artificial intelligence full stack software tools', icon: <Code2 className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'khmer_classics', label: 'Khmer Classics', query: 'sinn sisamouth ros sereysothea khmer golden oldies', icon: <Radio className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'yearning_indie', label: 'Yearning Indie', query: 'melancholic indie bedroom pop yearning hits', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'lofi_code', label: 'Lo-Fi Code', query: 'lofi hip hop relaxing study beats coding', icon: <Tv className="w-3.5 h-3.5 text-cyan-400" /> },
];
