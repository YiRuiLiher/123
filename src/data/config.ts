import { Category, VideoConfig } from '../types';

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
  ],
  categories: [
    { id: 'all', name: '全部' },
    { id: 'animation', name: '动画' },
    { id: 'gaming', name: '游戏' },
    { id: 'music', name: '音乐' },
    { id: 'lifestyle', name: '生活' }
  ]
};

