import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, MessageSquare, MessageSquareOff, ArrowLeft } from 'lucide-react';
import { formatTime, cn } from '../lib/utils';
import { DanmakuOverlay } from './DanmakuOverlay';
import { Danmaku } from '../types';

interface VideoPlayerProps {
  url: string;
  danmakus: Danmaku[];
  onBack?: () => void;
}

export function VideoPlayer({ url, danmakus, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [quality, setQuality] = useState('1080P');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const qualities = ['1080P', '720P', '480P', '360P'];

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changePlaybackRate = () => {
    const nextIndex = (playbackRates.indexOf(playbackRate) + 1) % playbackRates.length;
    const newRate = playbackRates[nextIndex];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 3) {
      setIsWaiting(false);
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsWaiting(true);
    const handlePlaying = () => setIsWaiting(false);
    const handleCanPlay = () => setIsWaiting(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleProgressMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    setIsDragging(true);
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!progressRef.current || !videoRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = pos * duration;
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isDragging) {
      setShowControls(false);
    }
  };

  const handleControlsMouseEnter = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };

  const handleControlsMouseLeave = () => {
    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex w-full h-full bg-black overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {onBack && (
        <button
          onClick={onBack}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          className={cn(
            "absolute top-4 left-4 z-50 flex items-center gap-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-opacity duration-300 text-sm font-medium",
            (showControls || isDragging || !isPlaying) ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
      )}

      {/* Background Gradient Mock Frame */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0"></div>

      {isWaiting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="absolute inset-0 w-full h-full animate-spin text-blue-500" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="200 283"
                strokeLinecap="round"
                className="opacity-80"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="100 283"
                strokeDashoffset="140"
                strokeLinecap="round"
                className="opacity-40"
              />
            </svg>
            <div className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>
      )}

      <video
        key={url}
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain cursor-pointer z-10"
        onClick={togglePlay}
        preload="metadata"
        playsInline
      />

      {showDanmaku && (
        <DanmakuOverlay 
          danmakus={danmakus} 
          currentTime={currentTime} 
          isPlaying={isPlaying} 
        />
      )}

      {/* Player Controls */}
      <div 
        className={cn(
          "absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end px-4 pb-2 gap-2 transition-opacity duration-300 z-20",
          (showControls || isDragging) ? "opacity-100" : "opacity-0"
        )}
        onMouseEnter={handleControlsMouseEnter}
        onMouseLeave={handleControlsMouseLeave}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlay}
            className="text-white hover:text-blue-400 transition-colors focus:outline-none"
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>

          <div className="text-xs text-white/90 font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div 
            ref={progressRef}
            className="flex-1 h-2 -my-0.5 py-0.5 relative cursor-pointer group/progress"
            onMouseDown={handleProgressMouseDown}
          >
            <div className="w-full h-1 bg-white/20 rounded-full mt-0.5 relative pointer-events-none group-hover/progress:scale-y-150 transition-transform">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              ></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 group/volume">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors focus:outline-none"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 transition-all duration-300 accent-blue-500 h-1 cursor-pointer"
              />
            </div>

            <div 
              onClick={changePlaybackRate}
              className="text-[10px] border border-white/40 px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer text-white/90 select-none"
              title="播放速度"
            >
              {playbackRate}x
            </div>

            {/* Quality Selector */}
            <div className="relative group/quality">
              <div 
                className="text-[10px] border border-white/40 px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer text-white/90 hidden sm:block select-none"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
              >
                {quality}
              </div>
              
              {showQualityMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded overflow-hidden flex flex-col min-w-[70px] shadow-2xl py-1 z-50">
                  {qualities.map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={cn(
                        "text-xs py-1.5 px-3 hover:bg-white/10 transition-colors text-center w-full",
                        quality === q ? "text-blue-400 font-medium" : "text-white/90"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowDanmaku(!showDanmaku)}
              className={cn(
                "transition-colors focus:outline-none",
                showDanmaku ? "text-blue-400" : "text-white/70 hover:text-white"
              )}
              title="Toggle Danmaku"
            >
              {showDanmaku ? <MessageSquare className="h-4 w-4" /> : <MessageSquareOff className="h-4 w-4" />}
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
