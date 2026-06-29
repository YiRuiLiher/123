import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { videos, AppConfig } from '../data/config';
import { VideoCard } from '../components/VideoCard';
import { cn } from '../lib/utils';
import { TrendingUp } from 'lucide-react';

export function Home() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const activeCategory = categoryId || 'all';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [rankingPeriod, setRankingPeriod] = useState<'today' | 'week' | 'month'>('today');

  let filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.categoryId === activeCategory);
    
  if (searchQuery) {
    filteredVideos = filteredVideos.filter(v => 
      v.title.toLowerCase().includes(searchQuery) || 
      (v.description && v.description.toLowerCase().includes(searchQuery))
    );
  }

  // Mock sorting logic for ranking period
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    // Simulated mock changes based on period
    const multiplierA = rankingPeriod === 'today' ? (a.id.charCodeAt(0) % 2 + 1) : rankingPeriod === 'week' ? (a.id.charCodeAt(0) % 3 + 1) : 1;
    const multiplierB = rankingPeriod === 'today' ? (b.id.charCodeAt(0) % 2 + 1) : rankingPeriod === 'week' ? (b.id.charCodeAt(0) % 3 + 1) : 1;
    return (b.views * multiplierB) - (a.views * multiplierA);
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
          {AppConfig.navigation.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border",
                activeCategory === category.id
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-[#151515] text-gray-400 border-white/10 hover:bg-white/5 hover:text-white"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-[#151515] p-1 rounded-full border border-white/5 w-fit">
          <div className="pl-3 pr-2 flex items-center text-gray-500">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs font-medium tracking-wider">播放排名:</span>
          </div>
          <button
            onClick={() => setRankingPeriod('today')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              rankingPeriod === 'today' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
            )}
          >
            今天
          </button>
          <button
            onClick={() => setRankingPeriod('week')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              rankingPeriod === 'week' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
            )}
          >
            本周
          </button>
          <button
            onClick={() => setRankingPeriod('month')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              rankingPeriod === 'month' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
            )}
          >
            本月
          </button>
        </div>
      </div>

      {sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-sm font-medium text-gray-500">
            该分类下暂无视频。
          </p>
        </div>
      )}
    </div>
  );
}
