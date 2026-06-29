import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import { formatNumber } from '../lib/utils';

interface VideoCardProps {
  video: Video;
  key?: string | number;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link 
      to={`/video/${video.id}`} 
      className="group flex flex-col gap-3 p-2 rounded-xl bg-transparent transition-all hover:bg-white/5 border border-transparent hover:border-white/5"
      onMouseEnter={(e) => {
        const v = e.currentTarget.querySelector('video');
        if (v) v.play().catch(() => {});
      }}
      onMouseLeave={(e) => {
        const v = e.currentTarget.querySelector('video');
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/5 shadow-lg group-hover:shadow-2xl">
        <video
          src={`${video.url}#t=0.001`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          preload="metadata"
          muted
          playsInline
          loop
        />
      </div>
      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-blue-400 transition-colors leading-snug">
          {video.title}
        </h3>
        <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-gray-500">
          <span>{video.author}</span>
          <div className="flex items-center font-medium text-[10px]">
            <span>{formatNumber(video.views)} 播放</span>
            <span className="mx-1">•</span>
            <span>{formatNumber(video.likes)} 赞</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
