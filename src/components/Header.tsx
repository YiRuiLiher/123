import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PlaySquare, Activity, Search } from 'lucide-react';
import { AppConfig } from '../data/config';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setSearchValue(searchParams.get('search') || '');
  }, [location.search]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const basePath = location.pathname.startsWith('/videos') ? location.pathname : '/videos';
      if (searchValue.trim()) {
        navigate(`${basePath}?search=${encodeURIComponent(searchValue.trim())}`);
      } else {
        navigate(basePath);
      }
    }
  };

  const handleSearchClick = () => {
    const basePath = location.pathname.startsWith('/videos') ? location.pathname : '/videos';
    if (searchValue.trim()) {
      navigate(`${basePath}?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate(basePath);
    }
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-white/5 flex-shrink-0 relative z-40">
        <div className="flex items-center gap-8">
          <Link to="/videos" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <PlaySquare className="h-7 w-7 text-blue-500" />
            <span className="text-2xl font-bold tracking-tighter text-blue-500 hidden sm:block">
              {AppConfig.appName}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {/* 顶部的网络诊断已移除，保留右侧按钮 */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-medium border border-blue-500/20"
            title="返回网络诊断"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>网络诊断</span>
          </Link>

          <div className="relative hidden sm:block">
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="搜索视频..." 
              className="bg-[#151515] border border-white/10 rounded-full py-1.5 px-4 w-48 lg:w-64 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors pr-8" 
            />
            <button 
              onClick={handleSearchClick}
              className="absolute right-3 top-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
