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
  FileText,
  RefreshCw,
  Lock,
  ArrowLeft,
  HardDrive,
  Clock,
  Info,
  ExternalLink,
  Save,
  X,
  Sparkles,
  BrainCircuit,
  Wand2
} from 'lucide-react';
import { generateAIResponse } from '@/lib/gemini';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modified: string;
  permissions: string;
  owner: string;
  ext?: string;
}

export default function FilesPage() {
  const { isDemo } = useAuth();
  const [currentPath, setCurrentPath] = useState<string[]>(['var', 'www']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);

  const handleAiAction = async (action: 'explain' | 'fix' | 'optimize') => {
    if (!editContent) return;
    setIsAiWorking(true);
    try {
      let prompt = '';
      if (action === 'explain') {
        prompt = `Explain this code in a concise way:\n\n${editContent}`;
      } else if (action === 'fix') {
        prompt = `Find and fix any bugs in this code. Return ONLY the fixed code:\n\n${editContent}`;
      } else if (action === 'optimize') {
        prompt = `Optimize this code for performance and readability. Return ONLY the optimized code:\n\n${editContent}`;
      }

      const response = await generateAIResponse(prompt, "You are an AI Code Assistant.");
      
      if (action === 'explain') {
        toast.info('AI Explanation', { description: response });
      } else {
        setEditContent(response);
        toast.success(`Code ${action === 'fix' ? 'fixed' : 'optimized'} by AI`);
      }
    } catch (error) {
      toast.error('AI Assistant failed');
    } finally {
      setIsAiWorking(false);
    }
  };

  const pathString = '/' + currentPath.join('/');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');

  const fetchFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      } else {
        throw new Error(data.error || 'Failed to fetch files');
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(pathString);
  }, [pathString]);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      toast.success(`Simulation: ${action}`, {
        description: `Action "${action}" was simulated in Demo Mode.`
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

  const handleCreate = async () => {
    if (handleDemoAction(`Create ${newItemType}`)) return;
    if (!newItemName) return;

    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `${pathString}/${newItemName}`, type: newItemType })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsCreateModalOpen(false);
        setNewItemName('');
        fetchFiles(pathString);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleRename = async () => {
    if (handleDemoAction('Rename')) return;
    if (!renameTarget || !newName) return;

    try {
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPath: `${pathString}/${renameTarget.name}`, 
          newPath: `${pathString}/${newName}` 
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsRenameModalOpen(false);
        setRenameTarget(null);
        setNewName('');
        fetchFiles(pathString);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleDelete = async () => {
    if (handleDemoAction('Delete')) return;
    if (!selectedFile) return;

    try {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: [`${pathString}/${selectedFile.name}`] })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsDeleteModalOpen(false);
        setSelectedFile(null);
        fetchFiles(pathString);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleEdit = async (file: FileItem) => {
    if (handleDemoAction('Edit')) return;
    
    try {
      const res = await fetch(`/api/files/content?path=${encodeURIComponent(pathString + '/' + file.name)}`);
      const data = await res.json();
      if (res.ok) {
        setEditContent(data.content);
        setEditingFile(file);
        setIsEditing(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleSave = async () => {
    if (!editingFile) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/files/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `${pathString}/${editingFile.name}`, content: editContent })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsEditing(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handleDemoAction('Upload')) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', pathString);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchFiles(pathString);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="h-full flex flex-col bg-[#0d1117]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                {editingFile?.name}
              </h2>
              <p className="text-[10px] font-mono text-slate-500">{pathString}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 mr-4">
              <button 
                onClick={() => handleAiAction('explain')}
                disabled={isAiWorking}
                className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3" /> EXPLAIN
              </button>
              <button 
                onClick={() => handleAiAction('fix')}
                disabled={isAiWorking}
                className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <Wand2 className="w-3 h-3" /> FIX BUGS
              </button>
              <button 
                onClick={() => handleAiAction('optimize')}
                disabled={isAiWorking}
                className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 hover:text-fuchsia-400 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <BrainCircuit className="w-3 h-3" /> OPTIMIZE
              </button>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-mono text-xs font-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              SAVE CHANGES
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          {isAiWorking && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-cyan-400 font-mono text-sm animate-pulse tracking-widest uppercase">AI is processing your code...</p>
            </div>
          )}
          <textarea 
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-transparent p-8 text-sm font-mono text-slate-300 focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
            <button 
              onClick={goBack}
              disabled={currentPath.length === 0}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigateTo(['var', 'www'])}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 font-mono text-sm overflow-x-auto no-scrollbar max-w-md">
            <span className="text-slate-600">/</span>
            {currentPath.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <button 
                  onClick={() => navigateTo(currentPath.slice(0, i + 1))}
                  className="text-slate-400 hover:text-cyan-400 transition-colors whitespace-nowrap"
                >
                  {p}
                </button>
                <ChevronRight className="w-3 h-3 text-slate-700" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-400 transition-all w-48"
            />
          </div>
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-1" />
          <button 
            onClick={() => { setNewItemType('folder'); setIsCreateModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg font-mono text-sm transition-all"
          >
            <FolderPlus className="w-4 h-4" /> New Folder
          </button>
          <button 
            onClick={() => { setNewItemType('file'); setIsCreateModalOpen(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg font-mono text-sm transition-all"
          >
            <FilePlus className="w-4 h-4" /> New File
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-mono text-sm font-black cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            {isUploading ? 'UPLOADING...' : 'UPLOAD'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
              <p className="text-slate-500 font-mono text-sm">Indexing filesystem...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedFile(file)}
                  onDoubleClick={() => file.type === 'folder' ? enterFolder(file.name) : handleEdit(file)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${
                    selectedFile?.id === file.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="relative">
                    {file.type === 'folder' ? (
                      <Folder className={`w-12 h-12 ${selectedFile?.id === file.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    ) : (
                      <File className={`w-12 h-12 ${selectedFile?.id === file.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                    )}
                    {file.ext && (
                      <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] font-bold font-mono px-1 rounded border border-white/10 text-white uppercase">
                        {file.ext}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-300 truncate w-full px-2">{file.name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Name</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Size</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Modified</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden xl:table-cell">Permissions</th>
                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFiles.map((file) => (
                    <tr 
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      onDoubleClick={() => file.type === 'folder' ? enterFolder(file.name) : handleEdit(file)}
                      className={`group hover:bg-white/5 transition-colors cursor-pointer ${selectedFile?.id === file.id ? 'bg-cyan-500/5' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {file.type === 'folder' ? (
                            <Folder className="w-4 h-4 text-slate-400" />
                          ) : (
                            <File className="w-4 h-4 text-slate-500" />
                          )}
                          <span className={`text-sm font-mono ${selectedFile?.id === file.id ? 'text-cyan-400' : 'text-slate-300'}`}>{file.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-mono text-slate-500">{file.size}</td>
                      <td className="p-3 text-xs font-mono text-slate-500">{file.modified}</td>
                      <td className="p-3 text-xs font-mono text-cyan-400 hidden xl:table-cell"><span className="bg-cyan-500/10 px-2 py-0.5 rounded">{file.permissions}</span></td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setRenameTarget(file); setNewName(file.name); setIsRenameModalOpen(true); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-cyan-400">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFile(file); setIsDeleteModalOpen(true); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-black/60 border-l border-white/10 backdrop-blur-xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">File Properties</h3>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-white/10 rounded text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
                    {selectedFile.type === 'folder' ? (
                      <Folder className="w-16 h-16 text-cyan-400" />
                    ) : (
                      <File className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white break-all">{selectedFile.name}</h4>
                    <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest">{selectedFile.type}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <HardDrive className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Size</span>
                    </div>
                    <span className="text-xs font-mono text-white">{selectedFile.size}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Modified</span>
                    </div>
                    <span className="text-xs font-mono text-white">{selectedFile.modified}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Perms</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">{selectedFile.permissions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Info className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Owner</span>
                    </div>
                    <span className="text-xs font-mono text-white">{selectedFile.owner}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setRenameTarget(selectedFile); setNewName(selectedFile.name); setIsRenameModalOpen(true); }}
                      className="py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-3 h-3" /> RENAME
                    </button>
                    {selectedFile.type === 'file' && (
                      <button 
                        onClick={() => handleEdit(selectedFile)}
                        className="py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-3 h-3" /> EDIT
                      </button>
                    )}
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className={`py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${selectedFile.type === 'folder' ? 'col-span-1' : ''}`}
                    >
                      <Trash2 className="w-3 h-3" /> DELETE
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-black/60 border-t border-white/10">
                <button className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors">
                  <span>View Full Path</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {newItemType === 'folder' ? <FolderPlus className="w-5 h-5 text-cyan-400" /> : <FilePlus className="w-5 h-5 text-cyan-400" />}
                Create New {newItemType === 'folder' ? 'Folder' : 'File'}
              </h3>
              <input 
                type="text"
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder={`Enter ${newItemType} name...`}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs font-bold transition-all">CANCEL</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-mono text-xs font-black transition-all">CREATE</button>
              </div>
            </motion.div>
          </div>
        )}

        {isRenameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRenameModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Edit className="w-5 h-5 text-cyan-400" />
                Rename Item
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Original: {renameTarget?.name}</p>
              <input 
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button onClick={() => setIsRenameModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs font-bold transition-all">CANCEL</button>
                <button onClick={handleRename} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-mono text-xs font-black transition-all">RENAME</button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Item?</h3>
              <p className="text-sm text-slate-400 font-mono mb-8">
                Are you sure you want to delete <span className="text-rose-400 font-bold">{selectedFile?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs font-bold transition-all">CANCEL</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-mono text-xs font-black transition-all">DELETE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
