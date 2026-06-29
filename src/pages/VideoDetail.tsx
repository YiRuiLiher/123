import React, { useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { videos } from '../data/config';
import { VideoPlayer } from '../components/VideoPlayer';
import { Danmaku, Comment } from '../types';
import { generateId, formatNumber } from '../lib/utils';

const initialDanmakus: Record<string, Danmaku[]> = {
  v1: [
    { id: '1', text: 'First blood!', time: 2, color: '#ffffff' },
    { id: '2', text: 'This is awesome', time: 5, color: '#ffeb3b' },
    { id: '3', text: 'Lol', time: 10, color: '#ffffff' },
    { id: '4', text: 'Can\'t believe it', time: 15, color: '#ff5252' },
  ]
};

const initialComments: Record<string, Comment[]> = {
  v1: [
    { id: 'c1', videoId: 'v1', author: 'Digital_Nomad', content: 'The color grading in the opening shot is absolutely world-class. Would love to see a tutorial on how you processed this footage!', timestamp: Date.now() - 7200000 },
    { id: 'c2', videoId: 'v1', author: 'Alice_Wonders', content: 'Added to my travel wishlist. Stunning work!', timestamp: Date.now() - 18000000 },
  ]
};

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const video = videos.find(v => v.id === id);
  const upNextVideos = videos.filter(v => v.id !== id).slice(0, 4);
  
  const [danmakus, setDanmakus] = useState<Danmaku[]>(initialDanmakus[id || ''] || []);
  const [comments, setComments] = useState<Comment[]>(initialComments[id || ''] || []);
  const [danmakuInput, setDanmakuInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`hasLiked_${id}`) === 'true';
    }
    return false;
  });

  React.useEffect(() => {
    if (video && typeof window !== 'undefined') {
      const viewKey = `hasViewedSession_${id}`;
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, 'true');
        video.views += 1;
        localStorage.setItem(`views_${id}`, video.views.toString());
      }
    }
  }, [id, video]);

  const handleLikeToggle = () => {
    const newLikedState = !hasLiked;
    setHasLiked(newLikedState);
    if (video) {
      if (newLikedState) {
        video.likes += 1;
      } else {
        video.likes = Math.max(0, video.likes - 1);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`likes_${video.id}`, video.likes.toString());
        localStorage.setItem(`hasLiked_${video.id}`, newLikedState.toString());
      }
    }
  };

  if (!video) {
    return <Navigate to="/" replace />;
  }

  const handleSendDanmaku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!danmakuInput.trim()) return;
    
    const newDanmaku: Danmaku = {
      id: generateId(),
      text: danmakuInput,
      time: 1, 
      color: '#ffffff'
    };
    
    setDanmakus([...danmakus, newDanmaku]);
    setDanmakuInput('');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    const newComment: Comment = {
      id: generateId(),
      videoId: video.id,
      author: 'Guest_User',
      content: commentInput,
      timestamp: Date.now()
    };
    
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* Left Section: Player & Social */}
      <section className="flex-1 flex flex-col p-4 border-r border-white/5 overflow-y-auto">
        {/* Video Player Container */}
        <div className="relative bg-black rounded-xl aspect-video overflow-hidden shadow-2xl border border-white/5 group">
          <VideoPlayer 
            key={video.id}
            url={video.url} 
            danmakus={danmakus}
            onBack={() => navigate(-1)}
          />
        </div>
        
        {/* Video Metadata */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-semibold text-white leading-tight">
              {video.title}
            </h1>
            <div className="flex gap-4">
              <button 
                onClick={handleLikeToggle}
                className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
              >
                <span className={hasLiked ? "text-blue-400" : "text-gray-400"}>👍</span> 
                <span className={hasLiked ? "text-blue-400" : "text-gray-200"}>{formatNumber(video.likes)}</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('链接已复制到剪贴板！');
                }}
                title="分享"
                className="bg-[#1a1a1a] p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              >
                <span>📤</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatNumber(video.views)} 播放</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">#{video.categoryId}</span>
          </div>

          {video.descriptionImages && video.descriptionImages.length > 0 && (
            <div className="mt-4 flex flex-row flex-wrap gap-4">
              {video.descriptionImages.map((imgUrl, index) => (
                <img 
                  key={index} 
                  src={imgUrl} 
                  alt={`Description image ${index + 1}`} 
                  className="rounded-lg object-contain max-h-96 flex-grow md:flex-grow-0 border border-white/10" 
                />
              ))}
            </div>
          )}

          {video.description && (
            <p className="text-sm text-gray-400 mt-2 leading-snug">
              {video.description}
            </p>
          )}
        </div>

        {/* Danmaku Input (Mobile) */}
        <div className="lg:hidden mt-6 flex flex-col gap-2 pb-4 border-b border-white/5">
           <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">发送弹幕</h2>
           <form onSubmit={handleSendDanmaku} className="flex gap-2">
            <input
              type="text"
              value={danmakuInput}
              onChange={(e) => setDanmakuInput(e.target.value)}
              placeholder="发送弹幕..."
              className="flex-1 bg-[#151515] border border-white/10 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
            <button 
              type="submit"
              disabled={!danmakuInput.trim()}
              className="bg-blue-600 text-white px-3 rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              发送
            </button>
          </form>
        </div>

        {/* Comments Section */}
        <div className="mt-6 flex-1 flex flex-col gap-4">
          <div className="text-sm font-semibold border-b border-white/5 pb-2 text-white">
            {comments.length} 条评论
          </div>
          
          <form onSubmit={handleSendComment} className="flex gap-3 items-start mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
              G
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="添加评论..."
                className="w-full bg-transparent border-b border-white/10 focus:border-blue-500 focus:outline-none py-1 text-sm text-gray-200 placeholder-gray-600 transition-colors"
              />
              {commentInput.trim() && (
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-full transition-colors"
                  >
                    评论
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-4">
            {comments.map((comment, index) => (
              <div key={comment.id} className={`flex gap-3 items-start ${index > 0 ? 'opacity-80' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{comment.author}</span>
                    <span className="text-[10px] text-gray-500">
                      {Math.floor((Date.now() - comment.timestamp) / 3600000) > 0 
                        ? `${Math.floor((Date.now() - comment.timestamp) / 3600000)} 小时前` 
                        : '刚刚'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-snug">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Section: Sidebar / Recommendations */}
      <aside className="w-80 hidden lg:flex flex-col bg-[#080808] p-4 gap-4 overflow-y-auto">
        
        {/* Danmaku Input */}
        <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
           <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">弹幕</h2>
           <form onSubmit={handleSendDanmaku} className="flex gap-2">
            <input
              type="text"
              value={danmakuInput}
              onChange={(e) => setDanmakuInput(e.target.value)}
              placeholder="发送弹幕..."
              className="flex-1 bg-[#151515] border border-white/10 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
            <button 
              type="submit"
              disabled={!danmakuInput.trim()}
              className="bg-blue-600 text-white px-3 rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              发送
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">接下来播放</h2>
        </div>

        {/* Recommended Video Cards */}
        <div className="flex flex-col gap-4">
          {upNextVideos.map((v, i) => (
            <Link 
              to={`/video/${v.id}`} 
              key={v.id} 
              className={`flex gap-3 group ${i > 1 ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}
              onMouseEnter={(e) => {
                const el = e.currentTarget.querySelector('video');
                if (el) el.play().catch(() => {});
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector('video');
                if (el) {
                  el.pause();
                  el.currentTime = 0;
                }
              }}
            >
              <div className="w-32 h-20 bg-gray-800 rounded-lg flex-shrink-0 relative overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors">
                <video 
                  src={`${v.url}#t=0.001`} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  preload="metadata"
                  muted
                  playsInline
                  loop
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">{v.title}</h3>
                <span className="text-[10px] text-gray-500">{v.author}</span>
                <span className="text-[10px] text-gray-600">{formatNumber(v.views)} 播放</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories Tags */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            <Link to="/?search=自然" className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white cursor-pointer transition-colors">自然</Link>
            <Link to="/?search=4k" className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white cursor-pointer transition-colors">4K</Link>
            <Link to="/?search=教程" className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white cursor-pointer transition-colors">教程</Link>
            <Link to="/?search=vlog" className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white cursor-pointer transition-colors">Vlog</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
