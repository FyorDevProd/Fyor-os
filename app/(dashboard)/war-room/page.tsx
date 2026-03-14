'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crosshair, 
  ShieldAlert, 
  Globe, 
  Zap, 
  Activity, 
  Terminal, 
  AlertTriangle, 
  Radio, 
  Radar, 
  Target,
  Maximize2,
  RefreshCw,
  Eye,
  Lock,
  Cpu,
  ShieldCheck,
  Map as MapIcon
} from 'lucide-react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { toast } from 'sonner';

interface Attack {
  id: string;
  origin: string;
  coords: [number, number];
  target: string;
  intensity: number;
  timestamp: string;
}

export default function WarRoomPage() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Maintain a reasonable aspect ratio or cap the height
        const height = Math.min(600, width * 0.75);
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const fetchAttacks = async () => {
    try {
      const res = await fetch('/api/war-room/attacks');
      const data = await res.json();
      setAttacks(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch attack data');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchAttacks();
    };
    init();
    const interval = setInterval(fetchAttacks, 5000);
    return () => clearInterval(interval);
  }, []);

  // D3 Globe Logic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoOrthographic()
      .scale(Math.min(width, height) * 0.4)
      .translate([width / 2, height / 2])
      .rotate([rotation, -10]);

    const path = d3.geoPath(projection);

    // Load world data
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((data: any) => {
      const countries = topojson.feature(data, data.objects.countries);

      // Draw globe background
      svg.append("path")
        .datum({ type: "Sphere" })
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#050505")
        .attr("stroke", "#1e293b")
        .attr("stroke-width", "1");

      // Draw countries
      svg.selectAll(".country")
        .data((countries as any).features)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#0f172a")
        .attr("stroke", "#334155")
        .attr("stroke-width", "0.5");

      // Draw grid lines (graticule)
      svg.append("path")
        .datum(d3.geoGraticule())
        .attr("class", "graticule")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ffffff05")
        .attr("stroke-width", "0.5");

      // Draw attacks
      attacks.forEach(attack => {
        const [lon, lat] = attack.coords;
        const targetCoords: [number, number] = [106.8456, -6.2088]; // Simulated server location (Jakarta)
        
        const originPoint = projection([lon, lat]);
        const targetPoint = projection(targetCoords);

        if (originPoint && targetPoint) {
          // Draw attack line (arc)
          const link = { type: "LineString", coordinates: [[lon, lat], targetCoords] };
          svg.append("path")
            .datum(link as any)
            .attr("class", "attack-line")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", attack.intensity > 70 ? "#f43f5e" : "#f59e0b")
            .attr("stroke-width", "1.5")
            .attr("stroke-dasharray", "5,5")
            .style("opacity", 0.6)
            .append("animate")
            .attr("attributeName", "stroke-dashoffset")
            .attr("from", "100")
            .attr("to", "0")
            .attr("dur", "2s")
            .attr("repeatCount", "indefinite");

          // Draw origin point
          svg.append("circle")
            .attr("cx", originPoint[0])
            .attr("cy", originPoint[1])
            .attr("r", 4)
            .attr("fill", "#f43f5e")
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", "4;8;4")
            .attr("dur", "1s")
            .attr("repeatCount", "indefinite");
        }
      });

      // Draw target point (Server)
      const serverPoint = projection([106.8456, -6.2088]);
      if (serverPoint) {
        svg.append("circle")
          .attr("cx", serverPoint[0])
          .attr("cy", serverPoint[1])
          .attr("r", 6)
          .attr("fill", "#06b6d4")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
        
        svg.append("text")
          .attr("x", serverPoint[0] + 10)
          .attr("y", serverPoint[1] + 5)
          .text("FYOR CORE")
          .attr("fill", "#06b6d4")
          .attr("font-family", "monospace")
          .attr("font-size", "10px")
          .attr("font-weight", "bold");
      }
    });
  }, [attacks, rotation, dimensions]);

  // Auto-rotate globe
  useEffect(() => {
    const timer = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-6 font-mono selection:bg-cyan-500/30">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <Radar className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Global War Room</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                DEFENSE ACTIVE
              </span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="flex items-center gap-1 text-[10px] text-rose-400">
                <AlertTriangle className="w-3 h-3" />
                {attacks.length} THREATS DETECTED
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">System Time</span>
            <span className="text-xl font-black text-white">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Core Load</span>
            <span className="text-xl font-black text-cyan-400">12.4%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar: Threat Intel */}
        <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Active Target Intel
            </h3>
            <div className="space-y-3">
              {attacks.map(attack => (
                <div key={attack.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 group hover:border-rose-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">{attack.origin}</span>
                    <span className={`text-[10px] font-bold ${attack.intensity > 70 ? 'text-rose-500' : 'text-amber-500'}`}>
                      {attack.intensity}% INTENSITY
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${attack.intensity}%` }}
                        className={`h-full ${attack.intensity > 70 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase">{attack.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Defense Protocols
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all">
                AUTO-BLOCK
              </button>
              <button className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 transition-all">
                PURGE LOGS
              </button>
              <button className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all">
                HONEYPOT
              </button>
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all">
                ISOLATE
              </button>
            </div>
          </div>
        </div>

        {/* Center: 3D Globe Visualizer */}
        <div className="xl:col-span-2 relative" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" 
              style={{ width: dimensions.width * 0.75, height: dimensions.width * 0.75 }}
            />
            <div 
              className="absolute border border-cyan-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" 
              style={{ width: dimensions.width * 0.6, height: dimensions.width * 0.6 }}
            />
            <div 
              className="absolute border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" 
              style={{ width: dimensions.width * 0.5, height: dimensions.width * 0.5 }}
            />
          </div>
          
          <div className="relative z-10 flex items-center justify-center">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height} 
              className="cursor-move drop-shadow-[0_0_50px_rgba(6,182,212,0.1)]"
            />
          </div>

          {/* Globe Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all"><RefreshCw className="w-4 h-4" /></button>
            <div className="h-4 w-px bg-white/10" />
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all"><Maximize2 className="w-4 h-4" /></button>
            <div className="h-4 w-px bg-white/10" />
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Right Sidebar: Live Feed & Stats */}
        <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 h-[400px] flex flex-col">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live Intercept Feed
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {attacks.map((attack, i) => (
                <div key={i} className="text-[9px] font-mono border-l-2 border-rose-500/30 pl-3 py-1">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-rose-400 ml-2">INTERCEPT:</span>
                  <span className="text-slate-300 ml-1">Inbound {attack.target} request from {attack.origin}</span>
                  <div className="text-slate-500 mt-0.5">SRC_IP: {attack.coords.join(', ')} | ACTION: LOGGED</div>
                </div>
              ))}
              <div className="text-[9px] font-mono border-l-2 border-emerald-500/30 pl-3 py-1">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-emerald-400 ml-2">SYSTEM:</span>
                <span className="text-slate-300 ml-1">Autonomous Core heartbeat nominal</span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase">Global Threat Level</span>
                <span className="text-[10px] text-rose-500 font-bold">ELEVATED</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Blocked</span>
                <span className="text-xl font-black text-white">1,242</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Uptime</span>
                <span className="text-xl font-black text-white">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Grid Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-[-1]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
