import type { VideoItem, CommentItem } from '../types/youtube';

export const DEFAULT_API_KEY = 'AIzaSyDtiy5eYjQJi3h2JZfJNFI58PI6EUa2Kvo';
const API_KEY_STORAGE_KEY = 'immonkeitube_api_key';
const LEGACY_API_KEY_STORAGE_KEY = 'ustube_api_key';

export function getStoredApiKey(): string {
  try {
    const key = localStorage.getItem(API_KEY_STORAGE_KEY) || localStorage.getItem(LEGACY_API_KEY_STORAGE_KEY);
    return key && key.trim().length > 0 ? key.trim() : DEFAULT_API_KEY;
  } catch {
    return DEFAULT_API_KEY;
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function resetApiKey(): string {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset API key', e);
  }
  return DEFAULT_API_KEY;
}

// Convert ISO 8601 duration (e.g. PT4M13S, PT1H2M30S) to MM:SS or H:MM:SS
export function formatDuration(duration?: string): string {
  if (!duration) return '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format numbers into 1.2M, 450K, etc.
export function formatViews(views?: string | number): string {
  if (views === undefined || views === null) return '0 views';
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '0 views';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${num.toLocaleString()} views`;
}

export function formatLikes(likes?: string | number): string {
  if (likes === undefined || likes === null) return '0';
  const num = typeof likes === 'string' ? parseInt(likes, 10) : likes;
  if (isNaN(num)) return '0';

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString();
}

// Relative time calculation
export function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

// Parse YouTube URL or Video ID
export function parseYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If directly 11 chars alphanumeric + -_
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for youtube.com, youtu.be, shorts, live
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Fetch Popular / Trending Videos
export async function fetchPopularVideos(apiKey: string, categoryId?: string, regionCode = 'US'): Promise<VideoItem[]> {
  let url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=24&regionCode=${regionCode}&key=${apiKey}`;
  if (categoryId && categoryId !== '0') {
    url += `&videoCategoryId=${categoryId}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map(mapApiItemToVideoItem);
}

// Search Videos with query
export async function searchVideos(apiKey: string, query: string): Promise<VideoItem[]> {
  const searchUrl = `${BASE_URL}/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
  const response = await fetch(searchUrl);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Search API error: ${response.status}`);
  }

  const searchData = await response.json();
  const videoIds = (searchData.items || [])
    .map((item: any) => item.id?.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) {
    return [];
  }

  // Fetch full statistics and duration for the found video IDs
  try {
    const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      return (detailsData.items || []).map(mapApiItemToVideoItem);
    }
  } catch (err) {
    console.warn('Could not fetch video details, returning base search results', err);
  }

  return (searchData.items || []).map((item: any) => ({
    id: item.id?.videoId || '',
    title: item.snippet?.title || 'Untitled',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
    channelId: item.snippet?.channelId,
    publishedAt: item.snippet?.publishedAt || '',
    thumbnails: item.snippet?.thumbnails || {},
  }));
}

// Fetch single video details (when user opens a video directly or by ID)
export async function fetchVideoDetails(apiKey: string, videoId: string): Promise<VideoItem> {
  const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Video details error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found or is private.');
  }

  return mapApiItemToVideoItem(data.items[0]);
}

// Fetch comments for a video
export async function fetchVideoComments(apiKey: string, videoId: string): Promise<CommentItem[]> {
  const url = `${BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=25&order=relevance&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || '';
    if (message.includes('disabled comments') || response.status === 403) {
      return [];
    }
    throw new Error(message || `Comments error: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => {
    const top = item.snippet?.topLevelComment?.snippet;
    return {
      id: item.id,
      authorDisplayName: top?.authorDisplayName || 'YouTube User',
      authorProfileImageUrl: top?.authorProfileImageUrl || '',
      textDisplay: top?.textDisplay || '',
      publishedAt: top?.publishedAt || '',
      likeCount: top?.likeCount || 0,
    };
  });
}

function mapApiItemToVideoItem(item: any): VideoItem {
  return {
    id: item.id?.videoId || item.id || '',
    title: item.snippet?.title || 'Untitled',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
    channelId: item.snippet?.channelId,
    publishedAt: item.snippet?.publishedAt || '',
    thumbnails: item.snippet?.thumbnails || {},
    duration: formatDuration(item.contentDetails?.duration),
    viewCount: item.statistics?.viewCount,
    likeCount: item.statistics?.likeCount,
    commentCount: item.statistics?.commentCount,
    tags: item.snippet?.tags || [],
  };
}

// Fallback curated videos focused on Khmer Songs, Yearning Songs, and Tech & AI
export const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: '1g_O_7f_0u0',
    title: 'VannDa - Time To Rise feat. Master Kong Nay (Official Music Video)',
    description: 'Official music video for "Time To Rise" by VannDa featuring Master Kong Nay. Celebrating Cambodian heritage, traditional Chapei Dang Veng and modern music.',
    channelTitle: 'Baramey Production',
    publishedAt: '2021-03-28T12:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/1g_O_7f_0u0/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/1g_O_7f_0u0/maxresdefault.jpg' }
    },
    duration: '4:29',
    viewCount: '135000000',
    likeCount: '2150000',
    commentCount: '110000',
    tags: ['Khmer Song', 'VannDa', 'Master Kong Nay', 'Baramey', 'Cambodia']
  },
  {
    id: 'GxldQ9GyXfY',
    title: 'Stephen Sanchez - Until I Found You (Official Video)',
    description: 'The official music video for "Until I Found You" by Stephen Sanchez. Timeless yearning romantic ballad.',
    channelTitle: 'StephenSanchezVEVO',
    publishedAt: '2022-06-29T16:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/GxldQ9GyXfY/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/GxldQ9GyXfY/maxresdefault.jpg' }
    },
    duration: '3:04',
    viewCount: '385000000',
    likeCount: '4600000',
    commentCount: '62000',
    tags: ['Yearning', 'Romantic', 'Stephen Sanchez', 'Acoustic', 'Ballad']
  },
  {
    id: 'M576WGiDBdQ',
    title: 'React in 100 Seconds',
    description: 'React is a popular UI library for building responsive and modular frontends with JavaScript.',
    channelTitle: 'Fireship',
    publishedAt: '2020-09-08T18:00:10Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/M576WGiDBdQ/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/M576WGiDBdQ/maxresdefault.jpg' }
    },
    duration: '2:24',
    viewCount: '1940000',
    likeCount: '112000',
    commentCount: '3800',
    tags: ['Tech', 'React', 'Frontend', 'JavaScript', 'Web Dev']
  },
  {
    id: '2fZk_fJqX_A',
    title: 'Conan Gray - Heather (Official Music Video)',
    description: 'Official music video for "Heather" by Conan Gray. Melancholic yearning and emotional indie pop ballad.',
    channelTitle: 'Conan Gray',
    publishedAt: '2020-08-20T17:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/2fZk_fJqX_A/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/2fZk_fJqX_A/maxresdefault.jpg' }
    },
    duration: '3:24',
    viewCount: '215000000',
    likeCount: '3750000',
    commentCount: '89000',
    tags: ['Yearning', 'Heather', 'Conan Gray', 'Melancholic', 'Indie Pop']
  },
  {
    id: '7nosL3sHq0Q',
    title: 'Build and Deploy a Full Stack AI Application',
    description: 'Step-by-step masterclass to building a full stack web app with modern AI APIs, TypeScript, and Vite.',
    channelTitle: 'JavaScript Mastery',
    publishedAt: '2024-06-15T14:30:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/7nosL3sHq0Q/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/7nosL3sHq0Q/maxresdefault.jpg' }
    },
    duration: '42:15',
    viewCount: '480000',
    likeCount: '32000',
    commentCount: '1450',
    tags: ['Tech', 'Full Stack', 'AI', 'TypeScript', 'Web Dev']
  },
  {
    id: 'zQnBQ4tB3ZA',
    title: 'TypeScript in 100 Seconds',
    description: 'Learn the fundamentals of TypeScript, static typing, and interfaces in 100 seconds.',
    channelTitle: 'Fireship',
    publishedAt: '2021-02-09T17:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/zQnBQ4tB3ZA/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/zQnBQ4tB3ZA/maxresdefault.jpg' }
    },
    duration: '2:21',
    viewCount: '1540000',
    likeCount: '89000',
    commentCount: '2100',
    tags: ['Tech', 'TypeScript', 'Programming', 'JavaScript']
  },
  {
    id: 'PEM0Vs8jf1w',
    title: 'JVKE - golden hour (Official Music Video)',
    description: 'The official music video for "golden hour" by JVKE. Nostalgic piano melodies and cinematic yearning.',
    channelTitle: 'JVKE',
    publishedAt: '2022-10-12T16:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/PEM0Vs8jf1w/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/PEM0Vs8jf1w/maxresdefault.jpg' }
    },
    duration: '3:52',
    viewCount: '290000000',
    likeCount: '4100000',
    commentCount: '58000',
    tags: ['Yearning', 'Piano', 'Golden Hour', 'JVKE', 'Cinematic']
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio - beats to relax/study/code to ☕️',
    description: 'Peaceful music for coding, studying, and late night focus.',
    channelTitle: 'Lofi Girl',
    publishedAt: '2024-01-01T00:00:00Z',
    thumbnails: {
      high: { url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
      maxres: { url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg' }
    },
    duration: 'Live',
    viewCount: '68500000',
    likeCount: '7800000',
    commentCount: '490000',
    tags: ['Lo-Fi', 'Tech', 'Coding', 'Study', 'Chill']
  }
];
