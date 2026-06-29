export interface Category {
  id: string;
  name: string;
}

export interface VideoConfig {
  title: string;
  url: string;
  categoryId: string;
  author: string;
  description?: string;
  descriptionImages?: string[];
}

export interface Video extends VideoConfig {
  id: string;
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  videoId: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface Danmaku {
  id: string;
  text: string;
  time: number;
  color: string;
}
