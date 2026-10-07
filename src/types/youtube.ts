export interface VideoThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface VideoThumbnails {
  default?: VideoThumbnail;
  medium?: VideoThumbnail;
  high?: VideoThumbnail;
  standard?: VideoThumbnail;
  maxres?: VideoThumbnail;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId?: string;
  channelAvatar?: string;
  publishedAt: string;
  thumbnails: VideoThumbnails;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  tags?: string[];
}

export interface CommentItem {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
}

export interface VideoCategory {
  id: string;
  label: string;
  query?: string;
  icon?: string;
}

export interface SearchFilter {
  query: string;
  category: string;
  sortBy: 'relevance' | 'date' | 'viewCount' | 'rating';
}
