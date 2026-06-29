import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Zap, AlertTriangle, ChevronRight, Server, Wifi, Globe, Network } from 'lucide-react';
import { AreaChart, Area, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../lib/utils';

interface DataPoint {
  time: number;
  speed: number;
  ping: number;
}

export function SpeedTest() {
  const [speed, setSpeed] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [packetLoss, setPacketLoss] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const testRef = useRef<{ currentSpeed: number; targetSpeed: number; basePing: number; currentPing: number }>({ currentSpeed: 0, targetSpeed: 0, basePing: 0, currentPing: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const averageSpeed = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.speed, 0) / data.length).toFixed(4) : '0.0000';
  const averagePing = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.ping, 0) / data.length).toFixed(1) : '0.0';

  const stopTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsTesting(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTest = () => {
    setIsTesting(true);
    setData([]);
    setProgress(0);
    const basePing = 12 + Math.random() * 5;
    testRef.current = { 
      currentSpeed: 0, 
      targetSpeed: 250 + Math.random() * 150,
      basePing: basePing,
      currentPing: basePing + Math.random() * 2
    };
    setPing(basePing);
    setJitter(2 + Math.random() * 3);
    setPacketLoss(0);
    
    const duration = 60000; // 60 seconds
    const intervalTime = 200; // update every 200ms
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / totalSteps) * 100;
      setProgress(currentProgress);

      // Randomly adjust target speed occasionally for realism
      if (Math.random() < 0.1) {
        testRef.current.targetSpeed = 200 + Math.random() * 200;
      }

      // Smoothly approach target
      testRef.current.currentSpeed += (testRef.current.targetSpeed - testRef.current.currentSpeed) * 0.1 + (Math.random() * 20 - 10);
      const newSpeed = Math.max(0, testRef.current.currentSpeed);
      
      // Calculate Ping fluctuation
      testRef.current.currentPing = testRef.current.basePing + (Math.random() * 4 - 2);
      const newPing = Math.max(1, testRef.current.currentPing);

      // Calculate Jitter
      setJitter(prev => prev * 0.9 + Math.abs(testRef.current.currentPing - newPing) * 0.1 + Math.random() * 1);
      
      // Calculate Packet Loss
      if (Math.random() < 0.05) {
        setPacketLoss(prev => prev + Math.random() * 0.01);
      }

      setSpeed(newSpeed);
      setPing(newPing);
      
      setData(prev => {
        return [...prev, { time: currentStep * intervalTime, speed: newSpeed, ping: newPing }];
      });

      if (currentStep >= totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTesting(false);
        setProgress(100);
      }
    }, intervalTime);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      navigate('/videos');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Speed Test UI */}
      <div className="max-w-4xl w-full p-8 text-center space-y-12 z-10">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className={cn("absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75", isTesting ? "animate-ping" : "")}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {isTesting ? 'DIAGNOSTICS_IN_PROGRESS' : 'SYSTEM_READY'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">网络诊断矩阵</h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
            检测您的当前网络连通性、下行带宽及节点延迟
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-1000 delay-150 fill-mode-both w-full max-w-full overflow-hidden">
          <div className="col-span-2 md:col-span-4 flex flex-col bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 md:p-6 relative overflow-hidden">
            {/* Chart Area */}
            <div className="flex justify-between items-end mb-6 z-10 flex-wrap gap-4">
              <div className="flex gap-4 md:gap-8 flex-wrap">
                <div className="text-left">
                  <span className="text-xs md:text-sm font-medium text-gray-500 mb-1 tracking-widest block">CURRENT (Mbps)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-6xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                      {speed.toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs md:text-sm font-medium text-gray-500 mb-1 tracking-widest block">AVERAGE (Mbps)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-6xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600">
                      {averageSpeed}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-auto">
                <div className="text-xs md:text-sm text-gray-500 mb-1 tracking-widest">PROGRESS</div>
                <div className="text-lg md:text-xl font-mono text-white">{progress.toFixed(0)}%</div>
              </div>
            </div>

            <div className="h-48 w-full z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(4)} ${name === 'speed' ? 'Mbps' : 'ms'}`, 
                      name === 'speed' ? 'Speed' : 'Ping'
                    ]}
                  />
                  <YAxis yAxisId="left" domain={[0, 'dataMax + 100']} hide />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 20']} hide />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpeed)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ping" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPing)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-200" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <Wifi className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-400">Ping</div>
            <div className="text-xl font-mono">{ping > 0 ? ping.toFixed(1) : '--'} <span className="text-xs text-gray-600">ms</span></div>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-400">Jitter</div>
            <div className="text-xl font-mono">{jitter > 0 ? jitter.toFixed(1) : '--'} <span className="text-xs text-gray-600">ms</span></div>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <Network className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-400">Packet Loss</div>
            <div className="text-xl font-mono">{progress > 0 ? (packetLoss * 100).toFixed(2) : '--'} <span className="text-xs text-gray-600">%</span></div>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-400">Server</div>
            <div className="text-sm font-medium text-blue-400/80 truncate w-full text-center">Tokyo, JP</div>
            <div className="text-xs text-gray-500 truncate w-full text-center">103.22.45.18</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both w-full">
          {isTesting ? (
            <button
              onClick={stopTest}
              className="w-full md:w-auto min-w-[200px] py-4 px-8 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-medium transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_-10px_rgba(220,38,38,0.4)]"
            >
              <Activity className="w-5 h-5 animate-pulse" />
              停止测试
            </button>
          ) : (
            <button
              onClick={startTest}
              className="w-full md:w-auto min-w-[200px] py-4 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]"
            >
              <Zap className="w-5 h-5" />
              {progress === 100 ? '重新测试' : '启动诊断'}
            </button>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full md:w-auto group py-4 px-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-white/10"
          >
            进阶测试引擎
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300",
        showConfirm ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
      )}>
        <div className={cn(
          "bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl transition-all duration-300",
          showConfirm ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}>
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative w-20 h-20">
                <svg className="absolute inset-0 w-full h-full animate-spin text-red-500" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="200 283" strokeLinecap="round" className="opacity-80" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="100 283" strokeDashoffset="140" strokeLinecap="round" className="opacity-40" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-white">建立加密连接中...</h3>
                <p className="text-sm text-gray-400">正在分配高带宽节点</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-3 text-center mb-8">
                <h3 className="text-2xl font-bold text-white tracking-tight">高带宽预警</h3>
                <p className="text-gray-400 leading-relaxed">
                  即将接入高并发视频流测试节点。此过程将消耗大量下行带宽，建议在 Wi-Fi 环境下进行。是否确认建立连接？
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConnect}
                  className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold tracking-wide transition-colors shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]"
                >
                  确认接入
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  终止请求
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
