'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  ChevronRight, 
  Home, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  FolderPlus, 
  FilePlus, 
  RefreshCw,
  ArrowLeft,
  HardDrive,
  Clock,
  Info,
  ExternalLink
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'dir' | 'file';
  size: string;
  modified: string;
  extension?: string;
}

const mockFiles: Record<string, FileItem[]> = {
  'root': [
    { name: 'var', type: 'dir', size: '-', modified: '2026-03-10 08:30' },
    { name: 'etc', type: 'dir', size: '-', modified: '2026-03-09 14:20' },
    { name: 'home', type: 'dir', size: '-', modified: '2026-03-12 11:05' },
    { name: 'root', type: 'dir', size: '-', modified: '2026-03-13 09:00' },
    { name: 'docker-compose.yml', type: 'file', size: '2.4 KB', modified: '2026-03-13 10:45', extension: 'yml' },
  ],
  'var': [
    { name: 'www', type: 'dir', size: '-', modified: '2026-03-12 15:30' },
    { name: 'log', type: 'dir', size: '-', modified: '2026-03-13 12:00' },
    { name: 'mail', type: 'dir', size: '-', modified: '2026-03-01 09:00' },
  ],
  'var/www': [
    { name: 'fyor.dev', type: 'dir', size: '-', modified: '2026-03-13 10:00' },
    { name: 'api.fyor.dev', type: 'dir', size: '-', modified: '2026-03-12 11:00' },
    { name: 'index.html', type: 'file', size: '1.2 KB', modified: '2026-03-10 16:45', extension: 'html' },
  ],
  'var/www/fyor.dev': [
    { name: 'public', type: 'dir', size: '-', modified: '2026-03-13 10:00' },
    { name: 'src', type: 'dir', size: '-', modified: '2026-03-13 10:00' },
    { name: 'package.json', type: 'file', size: '1.2 KB', modified: '2026-03-13 10:00', extension: 'json' },
    { name: 'next.config.js', type: 'file', size: '450 B', modified: '2026-03-13 10:00', extension: 'js' },
    { name: '.env', type: 'file', size: '200 B', modified: '2026-03-13 10:00', extension: 'env' },
    { name: 'README.md', type: 'file', size: '3.5 KB', modified: '2026-03-13 10:00', extension: 'md' },
  ]
};

export default function FilesPage() {
  const { isDemo } = useAuth();
  const [currentPath, setCurrentPath] = useState<string[]>(['var', 'www', 'fyor.dev']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pathString = currentPath.length === 0 ? 'root' : currentPath.join('/');
  const files = mockFiles[pathString] || [];

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      toast.error('Access Denied', {
        description: `Action "${action}" is disabled in Demo Mode.`
      });
      return true;
    }
    return false;
  };

  const navigateTo = (path: string[]) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const enterFolder = (folderName: string) => {
    navigateTo([...currentPath, folderName]);
  };

  const goBack = () => {
    if (currentPath.length > 0) {
      navigateTo(currentPath.slice(0, -1));
    }
  };

  const handleUpload = () => {
    if (handleDemoAction('Upload File')) return;
    setIsUploading(true);
    toast.info('Uploading file...', { description: 'Simulating file transfer to server.' });
    setTimeout(() => {
      setIsUploading(false);
      toast.success('Upload complete', { description: 'File has been saved to ' + pathString });
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-cyan-400" />
            File Explorer
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage your server filesystem visually.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-mono text-sm font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-2"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            UPLOAD
          </button>
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Explorer Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Explorer Pane */}
        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={goBack}
                disabled={currentPath.length === 0}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigateTo([])}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
              >
                <Home className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[300px] md:max-w-md">
                {currentPath.length === 0 ? (
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest px-2">/ root</span>
                ) : (
                  currentPath.map((part, i) => (
                    <div key={i} className="flex items-center">
                      <button 
                        onClick={() => navigateTo(currentPath.slice(0, i + 1))}
                        className="px-2 py-1 hover:bg-white/10 rounded text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors whitespace-nowrap"
                      >
                        {part}
                      </button>
                      {i < currentPath.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleDemoAction('New Folder')} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors" title="New Folder">
                <FolderPlus className="w-4 h-4" />
              </button>
              <button onClick={() => handleDemoAction('New File')} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors" title="New File">
                <FilePlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* File List/Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">No files found</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">Try a different search term or directory.</p>
              </div>
            ) : viewMode === 'list' ? (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/60 backdrop-blur z-10">
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Name</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden md:table-cell">Size</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden lg:table-cell">Modified</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFiles.map((file, i) => (
                    <motion.tr 
                      key={file.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedFile(file)}
                      onDoubleClick={() => file.type === 'dir' && enterFolder(file.name)}
                      className={`group hover:bg-white/5 transition-all cursor-pointer ${selectedFile?.name === file.name ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {file.type === 'dir' ? (
                            <Folder className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                          ) : (
                            <File className="w-5 h-5 text-slate-400" />
                          )}
                          <span className={`text-sm font-mono ${file.type === 'dir' ? 'text-cyan-100 font-bold' : 'text-slate-300'}`}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-mono text-slate-500 hidden md:table-cell">{file.size}</td>
                      <td className="p-3 text-xs font-mono text-slate-500 hidden lg:table-cell">{file.modified}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDemoAction('Download'); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-cyan-400">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDemoAction('Delete'); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file, i) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedFile(file)}
                    onDoubleClick={() => file.type === 'dir' && enterFolder(file.name)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center group cursor-pointer ${
                      selectedFile?.name === file.name 
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                        : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-3 relative">
                      {file.type === 'dir' ? (
                        <Folder className="w-12 h-12 text-cyan-400 fill-cyan-400/10 group-hover:scale-110 transition-transform" />
                      ) : (
                        <File className="w-12 h-12 text-slate-400 group-hover:scale-110 transition-transform" />
                      )}
                      {file.extension && (
                        <span className="absolute -bottom-1 -right-1 px-1 bg-black/80 border border-white/20 rounded text-[8px] font-bold text-white uppercase">
                          {file.extension}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-mono truncate w-full px-2 ${file.type === 'dir' ? 'text-cyan-100 font-bold' : 'text-slate-300'}`}>
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{file.size}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '320px' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="hidden lg:flex flex-col bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl shrink-0"
            >
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-widest">Properties</h3>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-white/10 rounded text-slate-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center text-center border-b border-white/10">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/10">
                  {selectedFile.type === 'dir' ? (
                    <Folder className="w-12 h-12 text-cyan-400" />
                  ) : (
                    <File className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <h4 className="text-lg font-bold text-white font-mono break-all px-2">{selectedFile.name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase">
                  {selectedFile.type === 'dir' ? 'Directory' : `${selectedFile.extension?.toUpperCase() || 'Unknown'} File`}
                </p>
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Size</span>
                    <span className="text-xs font-mono text-slate-300">{selectedFile.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Modified</span>
                    <span className="text-xs font-mono text-slate-300">{selectedFile.modified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Path</span>
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[150px]">/{pathString}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button 
                    onClick={() => handleDemoAction('Download')}
                    className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> DOWNLOAD
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleDemoAction('Rename')}
                      className="py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-3 h-3" /> RENAME
                    </button>
                    <button 
                      onClick={() => handleDemoAction('Delete')}
                      className="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-black/60 border-t border-white/10">
                <button className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors">
                  <span>VIEW PERMISSIONS</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
