'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { 
  Database, 
  Plus, 
  Play, 
  Download, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Table2, 
  History,
  Trash2,
  Settings,
  TerminalSquare,
  Server,
  X,
  AlertTriangle
} from 'lucide-react';

const mockBackups = [
  { id: 1, dbName: 'fyor_main', date: '2026-03-14 02:00:00', size: '2.4 GB', status: 'Success' },
  { id: 2, dbName: 'wp_blog', date: '2026-03-13 02:00:00', size: '450 MB', status: 'Success' },
  { id: 3, dbName: 'analytics_db', date: '2026-03-12 02:00:00', size: '12.1 GB', status: 'Success' },
];

export default function DatabasesPage() {
  const { isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'query' | 'backups'>('overview');
  const [databases, setDatabases] = useState<any[]>([]);
  const [selectedDb, setSelectedDb] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dbToDelete, setDbToDelete] = useState<any>(null);
  const [newDb, setNewDb] = useState({ name: '', type: 'MySQL', username: '', password: '' });

  const fetchDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/databases');
      const data = await res.json();
      setDatabases(data);
      if (!selectedDb && data.length > 0) {
        setSelectedDb(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch databases');
      toast.error('Failed to load databases');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDb]);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleCreateDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDb.name || !newDb.username || !newDb.password) {
      return toast.error('All fields are required');
    }

    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Database created successfully');
        setDatabases([...databases, data.database]);
        setIsCreating(false);
        setNewDb({ name: '', type: 'MySQL', username: '', password: '' });
      } else {
        toast.error(data.error || 'Failed to create database');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const confirmDelete = async () => {
    if (!dbToDelete) return;
    try {
      const res = await fetch(`/api/databases/${dbToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Database deleted successfully');
        setDatabases(databases.filter(d => d.id !== dbToDelete.id));
        if (selectedDb?.id === dbToDelete.id) setSelectedDb(null);
      } else {
        toast.error(data.error || 'Failed to delete database');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setDbToDelete(null);
    }
  };

  const handleAskAi = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setQueryResults(null);
    setGeneratedSql('');
    
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedSql(`SELECT \n  username, \n  email, \n  created_at, \n  last_login \nFROM users \nWHERE status = 'active' \nORDER BY created_at DESC \nLIMIT 5;`);
      setIsGenerating(false);
      
      // Simulate auto-run after generation
      setTimeout(() => {
        setQueryResults([
          { username: 'admin', email: 'admin@fyor.os', created_at: '2026-01-15', last_login: '2026-03-13' },
          { username: 'johndoe', email: 'john@example.com', created_at: '2026-02-20', last_login: '2026-03-12' },
          { username: 'sarah_connor', email: 'sarah@skynet.com', created_at: '2026-02-25', last_login: '2026-03-10' },
          { username: 'neo', email: 'neo@matrix.net', created_at: '2026-03-01', last_login: '2026-03-13' },
          { username: 'trinity', email: 'trinity@matrix.net', created_at: '2026-03-05', last_login: '2026-03-11' },
        ]);
      }, 800);
    }, 1500);
  };

  const browseTable = (tableName: string) => {
    setSelectedTable(tableName);
    setQueryResults([
      { info: `No data available for table "${tableName}"` },
      { info: 'In a real environment, this would fetch live data from the database.' }
    ]);
  };

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      import('sonner').then(({ toast }) => {
        toast.success(`Simulation: ${action}`, {
          description: `Action "${action}" was simulated in Demo Mode.`
        });
      });
      return true;
    }
    return false;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Database Manager
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage, query, and backup your databases with AI.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchDatabases}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 font-mono text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-sm font-bold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Database
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/40 backdrop-blur-md border border-cyan-500/20 p-1 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: Table2 },
          { id: 'query', label: 'GUI Explorer', icon: Sparkles },
          { id: 'backups', label: 'Backups', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-white/5">
              <h2 className="font-mono text-cyan-400 flex items-center gap-2">
                <Server className="w-4 h-4" /> Active Databases
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search databases..." 
                  className="bg-black/50 border border-cyan-500/30 rounded-lg pl-9 pr-4 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-black/60">
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Size</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Connections</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Scanning ports...
                      </td>
                    </tr>
                  ) : databases.map((db) => (
                    <tr key={db.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-mono text-sm text-slate-200 flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-500" />
                        {db.name}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        <span className="px-2 py-1 bg-white/5 rounded text-xs border border-white/10">{db.type} {db.version}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{db.size}</td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{db.connections}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
                          db.status === 'Healthy' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${db.status === 'Healthy' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                          {db.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedDb(db);
                            setActiveTab('query');
                          }} 
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors" 
                          title="Explore"
                        >
                          <Table2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDemoAction('Manage Database')} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors" title="Manage">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDemoAction('Backup Database')} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Backup">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDbToDelete(db)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GUI EXPLORER TAB */}
        {activeTab === 'query' && selectedDb && (
          <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Left Sidebar: Schema Browser */}
            <div className="w-full lg:w-64 shrink-0 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-cyan-500/20 bg-white/5">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-3 h-3" /> {selectedDb.name}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <p className="px-3 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tables</p>
                {selectedDb?.tables?.length > 0 ? selectedDb.tables.map((table: string) => (
                  <button
                    key={table}
                    onClick={() => browseTable(table)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all flex items-center gap-2 ${
                      selectedTable === table 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Table2 className="w-3 h-3" />
                    {table}
                  </button>
                )) : (
                  <p className="px-3 py-2 text-xs font-mono text-slate-600">No tables found or access denied.</p>
                )}
              </div>
              <div className="p-4 border-t border-cyan-500/20 bg-black/20">
                <button 
                  onClick={() => handleDemoAction('Add Table')}
                  className="w-full py-2 border border-dashed border-cyan-500/30 rounded-lg text-[10px] font-mono text-cyan-500/70 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> New Table
                </button>
              </div>
            </div>

            {/* Main Content: Query & Results */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Top: Query Input */}
              <div className="bg-black/40 backdrop-blur-md border border-fuchsia-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-fuchsia-400 font-mono text-xs flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI Query Assistant
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Query History">
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI to generate a query... (e.g. 'Show active users')"
                    className="flex-1 bg-black/50 border border-fuchsia-500/20 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50"
                  />
                  <button 
                    onClick={handleAskAi}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white rounded-xl font-mono text-xs font-bold tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.2)]"
                  >
                    {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    RUN
                  </button>
                </div>
              </div>

              {/* Bottom: Results Grid */}
              <div className="flex-1 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-cyan-500/20 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono text-cyan-400 text-sm">
                      {selectedTable ? `Browsing: ${selectedTable}` : 'Query Results'}
                    </h3>
                  </div>
                  {queryResults && (
                    <div className="flex gap-2">
                      <button onClick={() => handleDemoAction('Export CSV')} className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors" title="Export CSV">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemoAction('Edit Row')} className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors" title="Edit Row">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-auto">
                  {!queryResults && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <TerminalSquare className="w-12 h-12 mb-4" />
                      <p className="font-mono text-sm">Select a table or ask AI to run a query.</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-cyan-500">
                      <RefreshCw className="w-8 h-8 mb-4 animate-spin" />
                      <p className="font-mono text-sm animate-pulse">Processing request...</p>
                    </div>
                  )}

                  {queryResults && (
                    <motion.table 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full text-left border-collapse"
                    >
                      <thead>
                        <tr className="border-b border-cyan-500/20 sticky top-0 bg-black z-10">
                          {Object.keys(queryResults[0]).map((key) => (
                            <th key={key} className="p-3 text-xs font-mono text-cyan-500 uppercase tracking-wider bg-cyan-500/5">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10">
                        {queryResults.map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors group">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="p-3 text-sm font-mono text-slate-300">
                                {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </motion.table>
                  )}
                </div>
                
                {queryResults && (
                  <div className="p-3 border-t border-cyan-500/20 bg-black/40 text-[10px] font-mono text-slate-500 flex justify-between">
                    <span>{queryResults.length} records found</span>
                    <span>Ready for editing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BACKUPS TAB */}
        {activeTab === 'backups' && (
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-white/5">
              <h2 className="font-mono text-cyan-400 flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Backups
              </h2>
              <button onClick={() => handleDemoAction('Run Backup')} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 font-mono text-xs hover:bg-cyan-500/20 transition-colors flex items-center gap-2">
                <Play className="w-3 h-3" /> Run Backup Now
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-black/60">
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Database</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Size</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {mockBackups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-sm text-slate-200 flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-500" />
                        {backup.dbName}
                      </td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{backup.date}</td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{backup.size}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {backup.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleDemoAction('Restore Backup')} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-300 text-xs font-mono hover:bg-white/10 transition-colors">
                          Restore
                        </button>
                        <button onClick={() => handleDemoAction('Download Backup')} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition-colors">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Database Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" /> Add Database
                </h2>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateDb} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Database Type</label>
                  <select 
                    value={newDb.type}
                    onChange={e => setNewDb({...newDb, type: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MySQL">MySQL / MariaDB</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="Redis">Redis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Database Name</label>
                  <input 
                    type="text" 
                    required
                    value={newDb.name}
                    onChange={e => setNewDb({...newDb, name: e.target.value})}
                    placeholder="e.g., my_app_db" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Username</label>
                  <input 
                    type="text" 
                    required
                    value={newDb.username}
                    onChange={e => setNewDb({...newDb, username: e.target.value})}
                    placeholder="e.g., db_user" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={newDb.password}
                    onChange={e => setNewDb({...newDb, password: e.target.value})}
                    placeholder="Enter strong password" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {dbToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDbToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Delete Database?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">{dbToDelete.name}</strong>? This action cannot be undone and will permanently erase all data within this database.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDbToDelete(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
