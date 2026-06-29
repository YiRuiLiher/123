import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { AppConfig } from '../data/config';

export function AdminUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('lifestyle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setMessage('准备上传...');

    const fileIdentifier = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    
    try {
      for (let i = 0; i < totalChunks; i++) {
        setMessage(`上传中: 正在上传分片 ${i + 1} / ${totalChunks} (${Math.round(((i) / totalChunks) * 100)}%)`);
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);
        
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('fileIdentifier', fileIdentifier);
        formData.append('chunkIndex', i.toString());

        const response = await fetch('/api/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`分片 ${i + 1} 上传失败 (${response.status})`);
        }
      }

      setMessage('文件上传完成，正在合并保存...');

      const title = selectedFile.name.replace(/\.[^/.]+$/, "");

      const mergeResponse = await fetch('/api/upload-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileIdentifier,
          totalChunks,
          originalName: selectedFile.name,
          title,
          description,
          categoryId
        }),
      });

      if (!mergeResponse.ok) {
        throw new Error(`文件合并失败 (${mergeResponse.status})`);
      }

      setStatus('success');
      setMessage('视频上传成功，自动跳转到首页...');
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: unknown) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : '上传发生错误';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-white min-h-[50vh]">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
        <Upload className="w-12 h-12 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold mb-6">上传新视频</h1>
        
        <div className="w-full space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">选择视频</label>
            <input 
              type="file" 
              accept="video/mp4,video/webm,video/ogg" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded w-full transition-colors flex items-center justify-center gap-2 border border-white/10"
              disabled={status === 'uploading'}
            >
              {selectedFile ? selectedFile.name : '点击选择视频文件'}
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">视频分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              disabled={status === 'uploading'}
            >
              {AppConfig.categories.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">视频描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 text-white h-24 resize-none focus:outline-none focus:border-blue-500"
              placeholder="请输入视频描述..."
              disabled={status === 'uploading'}
            />
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!selectedFile || status === 'uploading'}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-full w-full transition-colors flex items-center justify-center gap-2 mb-4"
        >
          {status === 'uploading' ? '上传中...' : '确认上传并保存'}
        </button>

        {status !== 'idle' && (
          <div className={`mt-2 p-4 rounded-xl flex items-start gap-3 w-full ${status === 'success' ? 'bg-green-500/10 border border-green-500/20' : status === 'uploading' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : status === 'uploading' ? (
              <Upload className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${status === 'success' ? 'text-green-400' : status === 'uploading' ? 'text-blue-400' : 'text-red-400'}`}>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
