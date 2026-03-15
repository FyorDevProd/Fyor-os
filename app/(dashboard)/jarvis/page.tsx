'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  Zap, 
  Terminal, 
  ShieldAlert, 
  RefreshCw, 
  Power,
  Sparkles,
  BrainCircuit,
  Waves,
  Command,
  Activity,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { GoogleGenAI, Type } from "@google/genai";

export default function JarvisVoicePage() {
  const { isDemo } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<{ cmd: string; res: string }[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop any current speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, []);

  const handleCommand = useCallback(async (cmd: string) => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const systemInstruction = `
        Abang adalah JARVIS, asisten AI untuk FYOR OS (Sistem Operasi Server).
        Tugas abang adalah memahami perintah suara user dan menentukan tindakan yang harus diambil.
        
        Daftar tindakan yang bisa abang lakukan:
        1. RESTART_SERVICE: Restart layanan seperti nginx, mysql, docker.
        2. BLOCK_IP: Blokir alamat IP tertentu.
        3. SYSTEM_SCAN: Jalankan pemindaian keamanan.
        4. STATUS_CHECK: Cek kondisi kesehatan server.
        5. PREDICT_INSIGHTS: Analisis tren server dan prediksi masalah.
        6. CHAT: Hanya ngobrol santai.
        
        Respon harus dalam format JSON:
        {
          "action": "NAMA_TINDAKAN",
          "target": "target_jika_ada",
          "response_text": "Kalimat yang akan diucapkan JARVIS dalam bahasa Indonesia yang keren dan profesional tapi santai."
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: cmd,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              target: { type: Type.STRING },
              response_text: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(result.text || '{}');
      
      // Simulate Predictive Insights
      if (data.action === 'PREDICT_INSIGHTS') {
        const insights = [
          "Berdasarkan tren 7 hari terakhir, RAM akan penuh dalam 4 jam. Sarankan optimasi cache.",
          "Traffic Nginx meningkat 30% dari biasanya. Waspadai potensi DDoS.",
          "Penggunaan CPU stabil, tapi disk I/O mulai melambat. Perlu cek kesehatan SSD."
        ];
        data.response_text = insights[Math.floor(Math.random() * insights.length)];
      }

      setResponse(data.response_text);
      setHistory(prev => [{ cmd, res: data.response_text }, ...prev].slice(0, 5));
      speak(data.response_text);
    } catch (err) {
      console.error('AI Command failed:', err);
      toast.error('Gagal memproses perintah.');
    } finally {
      setIsProcessing(false);
    }
  }, [speak]);

  const handleCommandRef = useRef<any>(null);
  useEffect(() => {
    handleCommandRef.current = handleCommand;
  }, [handleCommand]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          // Use the ref here
          handleCommandRef.current?.(text);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error('Gagal mendengar suara abang.');
        };
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Browser abang nggak support voice recognition.');
      return;
    }
    if (isDemo) {
      toast.info('Demo Mode', { description: 'Voice commands are simulated.' });
    }
    setTranscript('');
    setResponse('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop any current speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, []);


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          animate={{ 
            scale: isListening ? [1, 1.1, 1] : 1,
            rotate: isListening ? [0, 5, -5, 0] : 0
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-block p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-[40px] shadow-[0_0_50px_rgba(6,182,212,0.2)]"
        >
          <Bot className="w-16 h-16 text-cyan-400" />
        </motion.div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Jarvis Voice</h1>
          <p className="text-slate-500 font-mono text-sm mt-2">Voice-Activated Server Command & Control Center.</p>
        </div>
      </div>

      {/* Voice Visualizer */}
      <div className="bg-black/40 border border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center space-y-12 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
        
        {/* Waveform Animation */}
        <div className="flex items-center gap-1 h-24">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isListening || isSpeaking ? [20, Math.random() * 80 + 20, 20] : 10,
                opacity: isListening || isSpeaking ? 1 : 0.2
              }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
              className="w-2 bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2 relative z-10">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.p 
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-cyan-400 font-mono font-bold animate-pulse"
              >
                MENDENGARKAN...
              </motion.p>
            ) : isProcessing ? (
              <motion.p 
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-amber-400 font-mono font-bold"
              >
                MEMPROSES PERINTAH...
              </motion.p>
            ) : isSpeaking ? (
              <motion.p 
                key="speaking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-purple-400 font-mono font-bold"
              >
                JARVIS SEDANG BERBICARA...
              </motion.p>
            ) : (
              <motion.p 
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-slate-500 font-mono"
              >
                KLIK TOMBOL UNTUK MEMBERI PERINTAH
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Main Mic Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`relative p-10 rounded-full transition-all duration-500 group ${
            isListening 
              ? 'bg-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.5)]' 
              : 'bg-cyan-500 shadow-[0_0_80px_rgba(6,182,212,0.3)] hover:scale-110'
          }`}
        >
          {isListening ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
          
          {/* Ripple Effect */}
          {isListening && (
            <motion.div 
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-rose-500 rounded-full"
            />
          )}
        </button>

        {/* Transcript & Response Display */}
        <div className="w-full max-w-2xl space-y-6">
          {transcript && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Abang bilang:</span>
              <p className="text-xl font-bold text-white italic">&quot;{transcript}&quot;</p>
            </div>
          )}
          
          {response && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 relative"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-500 rotate-45" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-2">Jarvis:</span>
              <p className="text-xl font-bold text-cyan-100">{response}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Command History & Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Examples */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Command className="w-4 h-4 text-cyan-400" />
            Try Saying
          </h3>
          <div className="space-y-3">
            {[
              "Jarvis, restart layanan nginx.",
              "Blokir alamat IP 192.168.1.100.",
              "Jarvis, berikan prediksi insight server.",
              "Jalankan pemindaian keamanan sistem.",
              "Bagaimana kondisi kesehatan server hari ini?",
              "Halo Jarvis, apa kabar?"
            ].map((ex, i) => (
              <button 
                key={i}
                onClick={() => handleCommand(ex)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm text-slate-300 transition-all"
              >
                &quot;{ex}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Recent Commands
          </h3>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 italic font-mono">Belum ada riwayat perintah...</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="space-y-1 border-l-2 border-white/10 pl-4">
                  <p className="text-xs text-slate-400 font-mono">&quot;{item.cmd}&quot;</p>
                  <p className="text-[10px] text-cyan-500 font-mono">→ {item.res}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
