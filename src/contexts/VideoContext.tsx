import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video } from '../types';

interface VideoContextType {
  videos: Video[];
  loading: boolean;
  error: string | null;
  refreshVideos: () => Promise<void>;
}

const VideoContext = createContext<VideoContextType>({
  videos: [],
  loading: true,
  error: null,
  refreshVideos: async () => {},
});

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/videos');
      const contentType = res.headers.get('content-type');
      if (!res.ok) throw new Error(`获取视频失败 (${res.status})`);
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API 返回了非预期的格式 (可能服务正在启动或代理限制)');
      }
      
      const data = await res.json();
      
      // Hash function to create deterministic IDs for new videos without IDs
      const hashString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
      };

      const videosWithData: Video[] = data.map((config: any) => ({
        id: config.id || `v_${hashString(config.url)}`,
        title: config.title,
        url: config.url,
        categoryId: config.categoryId,
        author: config.author,
        views: config.views || Math.floor(Math.random() * 900000) + 100000,
        likes: config.likes || Math.floor(Math.random() * 90000) + 10000,
        comments: config.comments || Math.floor(Math.random() * 9000) + 1000,
        description: config.description,
        descriptionImages: config.descriptionImages || [],
        createdAt: config.createdAt || new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      }));
      
      setVideos(videosWithData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <VideoContext.Provider value={{ videos, loading, error, refreshVideos: fetchVideos }}>
      {children}
    </VideoContext.Provider>
  );
}

export const useVideos = () => useContext(VideoContext);
