import { Category, Video, VideoConfig } from '../types';
import videoData from './videos.json';

export const AppConfig = {
  // 修改此处的 appName 即可更改网站名称
  appName: 'NexusStream',
  // Configure which paths/categories to display in the top navigation header
  navigation: [
    { id: 'all', name: '全部', path: '/videos' },
    { id: 'animation', name: '动画', path: '/videos/animation' },
    { id: 'gaming', name: '游戏', path: '/videos/gaming' },
    { id: 'music', name: '音乐', path: '/videos/music' },
    { id: 'lifestyle', name: '生活', path: '/videos/lifestyle' }
  ]
};

const videoConfigs: VideoConfig[] = videoData as VideoConfig[];

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const videos: Video[] = videoConfigs.map(config => {
  const id = `v_${hashString(config.url)}`;
  let views = 0;
  let likes = 0;
  
  if (typeof window !== 'undefined') {
    const savedViews = localStorage.getItem(`views_${id}`);
    const savedLikes = localStorage.getItem(`likes_${id}`);
    if (savedViews) views = parseInt(savedViews, 10);
    if (savedLikes) likes = parseInt(savedLikes, 10);
  }
  
  return {
    ...config,
    id,
    views,
    likes
  };
});

