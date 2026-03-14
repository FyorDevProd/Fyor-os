'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  Terminal as TerminalIcon, 
  Loader2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Container, 
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  History,
  Sparkles,
  Command,
  Info
} from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { toast } from 'sonner';

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  action?: {
    type: 'bash' | 'docker' | 'firewall' | 'info';
    payload: any;
    status: 'executing' | 'success' | 'error';
    result?: string;
  };
}

// Tool Definitions
const executeBashCommandDeclaration: FunctionDeclaration = {
  name: 'execute_bash_command',
  description: 'Executes a bash command on the Linux server.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: { type: Type.STRING, description: 'The bash command to execute' }
    },
    required: ['command']
  }
};

const manageDockerDeclaration: FunctionDeclaration = {
  name: 'manage_docker',
  description: 'Manage a docker container (start, stop, restart, rm).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'start, stop, restart, or rm' },
      containerName: { type: Type.STRING, description: 'The name or ID of the container' }
    },
    required: ['action', 'containerName']
  }
};

const manageFirewallDeclaration: FunctionDeclaration = {
  name: 'manage_firewall',
  description: 'Manage firewall rules (allow or deny ports).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'allow or deny' },
      port: { type: Type.NUMBER, description: 'The port number' }
    },
    required: ['action', 'port']
  }
};

const getSystemInfoDeclaration: FunctionDeclaration = {
  name: 'get_system_info',
  description: 'Retrieves real-time system information including CPU, Memory, OS, and Disk usage.',
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};

export default function AssistantPage() {
  const { isDemo } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings, Admin. I am FYOR AI, your autonomous server operations core. I am now connected to the system hardware. I can execute bash commands, manage Docker, reconfigure firewall rules, and provide real-time system diagnostics. How shall we optimize the infrastructure today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  // Fetch real system stats for the sidebar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/system-info');
        const data = await res.json();
        setSystemStats(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Chat Session
  useEffect(() => {
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are FYOR AI, the central intelligence of the FYOR Server OS. 
        You are professional, efficient, and highly technical. 
        You have direct access to server tools. 
        When a user asks for a task, use the appropriate tool immediately. 
        Do not ask for permission if the intent is clear. 
        After tool execution, provide a concise technical summary of the outcome.
        If a command seems dangerous (like 'rm -rf /'), warn the user but provide the tool if they insist.
        You can now use 'get_system_info' to see real hardware data.`,
        tools: [{ 
          functionDeclarations: [
            executeBashCommandDeclaration, 
            manageDockerDeclaration, 
            manageFirewallDeclaration,
            getSystemInfoDeclaration
          ] 
        }]
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeTool = async (call: any): Promise<any> => {
    if (call.name === 'get_system_info') {
      try {
        const res = await fetch('/api/system-info');
        return await res.json();
      } catch (err) {
        return { error: 'Failed to fetch real-time system info' };
      }
    }

    // Simulations for other tools (since we don't want to actually break the container)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (call.name === 'execute_bash_command') {
          const cmd = call.args.command;
          if (cmd.includes('apt') || cmd.includes('install')) {
            resolve({ output: `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nThe following NEW packages will be installed:\n  ${cmd.split(' ').pop()}\n0 upgraded, 1 newly installed, 0 to remove.\n[OK] Deployment successful.` });
          } else if (cmd.includes('df') || cmd.includes('free') || cmd.includes('top')) {
            resolve({ output: `Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p3  477G  124G  329G  28% /\ntmpfs           6.3G     0  6.3G   0% /dev/shm\n\nMem: 16384MB Total, 4120MB Used, 12264MB Free` });
          } else {
            resolve({ output: `fyor@server:~$ ${cmd}\nExecution successful. Exit code: 0` });
          }
        } else if (call.name === 'manage_docker') {
          resolve({ output: `Container '${call.args.containerName}' state transition: ${call.args.action.toUpperCase()} -> SUCCESS\nLogs: Attached to process ${Math.floor(Math.random() * 10000)}` });
        } else if (call.name === 'manage_firewall') {
          resolve({ output: `UFW Rule Updated:\nAction: ${call.args.action.toUpperCase()}\nPort: ${call.args.port}/tcp\nStatus: Applied to all interfaces.` });
        } else {
          resolve({ error: 'Unknown system tool requested.' });
        }
      }, 1500);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userText }]);

    try {
      let response = await chatSessionRef.current.sendMessage({ message: userText });
      
      // Handle Function Calls (recursive if AI calls multiple tools)
      while (response.functionCalls && response.functionCalls.length > 0) {
        const toolResponses = [];
        
        for (const call of response.functionCalls) {
          const actionId = Date.now().toString() + Math.random().toString();
          
          // Add executing message to UI
          setMessages(prev => [...prev, {
            id: actionId,
            role: 'system',
            content: `Initiating ${call.name.replace(/_/g, ' ')}...`,
            action: {
              type: call.name === 'execute_bash_command' ? 'bash' : 
                    call.name === 'manage_docker' ? 'docker' : 
                    call.name === 'manage_firewall' ? 'firewall' : 'info',
              payload: call.args,
              status: 'executing'
            }
          }]);

          // Execute tool
          const result = await executeTool(call);

          // Update UI with result
          setMessages(prev => prev.map(msg => 
            msg.id === actionId ? { ...msg, action: { ...msg.action!, status: 'success', result: JSON.stringify(result, null, 2) } } : msg
          ));

          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: result
            }
          });
        }

        // Send results back to AI
        response = await chatSessionRef.current.sendMessage({
          message: toolResponses
        });
      }

      if (response.text) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.text
        }]);
      }

    } catch (error) {
      console.error('AI Core Error:', error);
      toast.error('AI Communication Error', { description: 'Failed to reach FYOR AI Core.' });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'System Error: Connection to AI Core interrupted. Please verify API configuration.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Check Disk Space', cmd: 'Check my disk usage' },
    { label: 'List Containers', cmd: 'Show all docker containers' },
    { label: 'System Health', cmd: 'Give me a system health report' },
    { label: 'Open Port 80', cmd: 'Open port 80 in firewall' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white font-mono uppercase tracking-widest">FYOR AI CORE v2.5</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-tighter">Autonomous Mode: ACTIVE</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
              <History className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role !== 'system' && (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    msg.role === 'user' 
                      ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' 
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {msg.role === 'user' ? <TerminalIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                )}
                
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : msg.role === 'system' ? 'w-full max-w-full items-center' : 'items-start'} flex flex-col gap-2`}>
                  
                  {msg.role === 'system' && msg.action ? (
                    <div className="w-full max-w-2xl bg-black/60 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          {msg.action.type === 'bash' && <TerminalIcon className="w-4 h-4 text-cyan-400" />}
                          {msg.action.type === 'docker' && <Container className="w-4 h-4 text-blue-400" />}
                          {msg.action.type === 'firewall' && <Shield className="w-4 h-4 text-rose-400" />}
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            {msg.action.type === 'bash' ? 'System Command' : msg.action.type === 'docker' ? 'Docker Engine' : 'Firewall Control'}
                          </span>
                        </div>
                        {msg.action.status === 'executing' ? (
                          <div className="flex items-center gap-2 text-amber-400 text-[10px] font-mono font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> EXECUTING
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3" /> COMPLETED
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-black/40 font-mono text-sm">
                        <div className="flex gap-2">
                          <span className="text-emerald-500">fyor@os:~$</span>
                          <span className="text-slate-200">
                            {msg.action.type === 'bash' && msg.action.payload.command}
                            {msg.action.type === 'docker' && `docker ${msg.action.payload.action} ${msg.action.payload.containerName}`}
                            {msg.action.type === 'firewall' && `ufw ${msg.action.payload.action} ${msg.action.payload.port}`}
                          </span>
                        </div>
                      </div>
                      {msg.action.result && (
                        <div className="p-4 border-t border-white/5 bg-black/20 font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                          {msg.action.result}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-slate-200 rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">AI is processing system request...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-cyan-500/20 bg-black/60 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { setInput(action.cmd); }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all whitespace-nowrap uppercase tracking-widest"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FYOR AI to manage your server..."
                className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-8 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-2xl font-mono font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            >
              <Sparkles className="w-5 h-5" />
              EXECUTE
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar Context */}
      <div className="hidden xl:flex flex-col w-80 gap-6">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 space-y-6">
          <h3 className="text-xs font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" /> System Context
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">CPU Load</span>
                <span className="text-xs font-mono text-emerald-400">
                  {systemStats?.cpu?.speed ? `${systemStats.cpu.speed} GHz` : '12%'}
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-emerald-400" />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Memory</span>
                <span className="text-xs font-mono text-cyan-400">
                  {systemStats?.mem?.used ? `${(systemStats.mem.used / 1024 / 1024 / 1024).toFixed(1)} GB` : '4.2 GB'}
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[25%] h-full bg-cyan-400" />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">OS Distro</span>
                <span className="text-xs font-mono text-fuchsia-400 truncate max-w-[120px]">
                  {systemStats?.os?.distro || 'Linux'}
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[28%] h-full bg-fuchsia-400" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              FYOR AI has full read/write access to the filesystem and network stack. All actions are logged in the audit trail.
            </p>
          </div>
        </div>

        <div className="flex-1 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <Zap className="w-12 h-12 text-cyan-400 mb-4 animate-pulse" />
          <h4 className="text-sm font-black text-white font-mono uppercase tracking-widest mb-2">AI Optimization</h4>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Asisten AI dapat membantu abang mengotomatisasi tugas-tugas server yang membosankan. Cukup ketik perintah dalam bahasa manusia.
          </p>
        </div>
      </div>
    </div>
  );
}
