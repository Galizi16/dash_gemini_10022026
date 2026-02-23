
import React, { useEffect, useState } from 'react';
import { supabase, getSystemDate, logMetric } from '../services/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import StatCard from '../components/StatCard';
import { RefreshCw, TrendingUp, Zap, Target, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

const YieldAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>({ vs3j: [], vs7j: [] });

  const fetchData = async () => {
    setLoading(true);
    logMetric('YIELD', 'Analysing yield performance data...');
    try {
      const { data: apercu } = await supabase
        .from('booking_apercu')
        .select('*')
        .order('Date', { ascending: true })
        .limit(30);

      const { data: vs3 } = await supabase.from('booking_vs_3j').select('*').limit(15);
      const { data: vs7 } = await supabase.from('booking_vs_7j').select('*').limit(15);

      if (apercu) setData(apercu);
      setTrends({ vs3j: vs3 || [], vs7j: vs7 || [] });

      logMetric('YIELD', 'Yield analysis complete', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mono">Calcul des algorithmes Yield...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analyses Yield & Tendances</h2>
          <p className="text-sm text-slate-500">Visualisation profonde des segments et dynamiques de prix</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-blue-400">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Indice de Confiance RMS" value="94" suffix="%" color="success" trend={+1.2} subValue="Stabilité des suggestions" />
        <StatCard label="Demande Moyenne" value="6.8" suffix="/10" color="primary" trend={+0.4} subValue="Horizon 30 jours" />
        <StatCard label="Nb Suggestions Hausse" value="12" color="purple" subValue="Pression capacitive détectée" />
        <StatCard label="Variation Prix Moy." value="+18.4" prefix="€" color="accent" trend={+5.6} subValue="vs période précédente" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="gradient-border p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" size={20} /> Pression de Demande Marché
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="Date" stroke="#475569" tick={{fontSize: 10}} tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} />
                <YAxis stroke="#475569" tick={{fontSize: 10}} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Demande du marche" name="Pression" stroke="#10b981" fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gradient-border p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <Target className="mr-2 text-purple-500" size={20} /> Écart vs Médiane Marché
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="Date" stroke="#475569" tick={{fontSize: 10}} tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} />
                <YAxis stroke="#475569" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="Votre hotel le plus bas" name="Notre BAR" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry["Votre hotel le plus bas"] > entry["mediane du compset"] ? '#8b5cf6' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="gradient-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center"><Zap size={18} className="mr-2 text-amber-400" /> Alertes & Signaux Business</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Diagnostics</span>
          </div>
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start space-x-4 group hover:bg-rose-500/10 transition-all">
                <ArrowUpRight className="text-rose-400 shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-slate-200">Surperformance ADR détectée</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Votre tarif moyen sur les weekends de Mai est supérieur de 22% à la médiane. Risque de perte d'occupation.
                  </p>
                </div>
             </div>
             <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start space-x-4 group hover:bg-emerald-500/10 transition-all">
                <ArrowDownRight className="text-emerald-400 shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-slate-200">Opportunité Pickup</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Forte accélération du pickup sur les nuits du 14-16 Juin. Suggestions de hausse tarifaire générées.
                  </p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="gradient-border p-6 flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Info className="text-blue-500" size={32} />
           </div>
           <h4 className="text-xl font-bold">Méthodologie YieldPro</h4>
           <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
             Nos algorithmes croisent les données de pickup internes avec la pression de demande externe et les mouvements du compset pour assurer un RevPAR optimal.
           </p>
           <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all">
             Consulter le guide de calibrage
           </button>
        </div>
      </div>
    </div>
  );
};

export default YieldAnalysis;
