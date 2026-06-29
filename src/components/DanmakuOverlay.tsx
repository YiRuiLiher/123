import React, { useEffect, useRef, useState } from 'react';
import { Danmaku } from '../types';

interface DanmakuOverlayProps {
  danmakus: Danmaku[];
  currentTime: number;
  isPlaying: boolean;
}

interface ActiveDanmaku extends Danmaku {
  top: number;
  key: string;
}

export function DanmakuOverlay({ danmakus, currentTime, isPlaying }: DanmakuOverlayProps) {
  const [active, setActive] = useState<ActiveDanmaku[]>([]);
  const lastTimeRef = useRef(currentTime);
  
  useEffect(() => {
    // Detect seek/scrub (time jumped by more than 1 second backwards or forwards)
    if (Math.abs(currentTime - lastTimeRef.current) > 1) {
      setActive([]);
    }

    if (!isPlaying) {
      lastTimeRef.current = currentTime;
      return;
    }

    // Only fire danmaku when playing forward naturally
    if (currentTime > lastTimeRef.current && currentTime - lastTimeRef.current <= 1) {
      const newDanmakus = danmakus.filter(
        d => d.time > lastTimeRef.current && d.time <= currentTime
      );

      if (newDanmakus.length > 0) {
        const added = newDanmakus.map(d => ({
          ...d,
          key: `${d.id}-${Date.now()}-${Math.random()}`,
          top: Math.random() * 70 // 0-70% from top to avoid blocking bottom controls
        }));
        
        setActive(prev => [...prev, ...added]);
      }
    }
    
    lastTimeRef.current = currentTime;
  }, [currentTime, isPlaying, danmakus]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {active.map(d => (
        <div
          key={d.key}
          className="absolute whitespace-nowrap text-base sm:text-xl font-semibold drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)] px-2 py-0.5 rounded"
          style={{
            top: `${d.top}%`,
            color: d.color || '#ffffff',
            animation: `danmaku 6s linear forwards`,
            animationPlayState: isPlaying ? 'running' : 'paused',
            textShadow: '1px 1px 2px black, 0 0 1em black'
          }}
          onAnimationEnd={() => {
            setActive(prev => prev.filter(item => item.key !== d.key));
          }}
        >
          {d.text}
        </div>
      ))}
    </div>
  );
}
