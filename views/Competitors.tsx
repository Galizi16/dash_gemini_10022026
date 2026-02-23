
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { RefreshCw, TrendingUp, Info, Calendar } from 'lucide-react';

const Competitors: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [competitorList, setCompetitorList] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: tarifs } = await supabase
        .from('booking_tarifs')
        .select('*')
        .order('Date', { ascending: true })
        .limit(60);

      if (tarifs && tarifs.length > 0) {
        // Dynamically extract competitor names (excluding meta columns)
        const meta = ['id', 'Date', 'Jour', 'date_mise_a_jour', 'hotel_id', 'Demande du marche'];
        const keys = Object.keys(tarifs[0]).filter(k => !meta.includes(k));
        setCompetitorList(keys);
        setData(tarifs);
      }
    } catch (err) {
      console.error('Error fetching competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mainHotel = "Folkestone Opera";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mono">Scan du Compset...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analyse Concurrence</h2>
          <p className="text-sm text-slate-500">Comparaison tarifaire BAR vs Compset (60 jours)</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-slate-100 transition-all hover:bg-white/10 active:scale-95">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="gradient-border p-6 h-[450px] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold mb-6 flex items-center shrink-0">
          <TrendingUp className="mr-2 text-blue-500" size={20} /> Évolution des tarifs Compset
        </h3>
        <div className="flex-1 w-full min-h-0" style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="Date" 
                stroke="#475569" 
                tick={{fontSize: 10}} 
                tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              />
              <YAxis stroke="#475569" tick={{fontSize: 10}} prefix="€" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey={mainHotel} 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false}
                name="Folkestone (Moi)"
                animationDuration={1500}
              />
              {competitorList.filter(c => c !== mainHotel).map((comp, idx) => (
                <Line 
                  key={comp}
                  type="monotone" 
                  dataKey={comp} 
                  stroke={`hsl(${idx * 55}, 70%, 50%)`} 
                  strokeWidth={1} 
                  strokeOpacity={0.4}
                  dot={false}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gradient-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111827] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-[#111827] z-20">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest text-right">Folkestone</th>
                {competitorList.filter(c => c !== mainHotel).map(comp => (
                  <th key={comp} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">{comp}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.04] transition-colors group text-sm">
                  <td className="px-6 py-4 font-bold text-slate-300 sticky left-0 bg-[#0d131f] z-10">
                    {new Date(row.Date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-400 mono">
                    {(row[mainHotel] || 0).toFixed(0)}€
                  </td>
                  {competitorList.filter(c => c !== mainHotel).map(comp => {
                    const price = row[comp];
                    const diff = price && row[mainHotel] ? price - row[mainHotel] : 0;
                    return (
                      <td key={comp} className="px-6 py-4 text-right text-slate-400 mono">
                        {price ? `${price.toFixed(0)}€` : 'Indisp.'}
                        {price && diff !== 0 && (
                          <span className={`text-[10px] ml-1 font-bold ${diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ({diff > 0 ? '+' : ''}{diff.toFixed(0)}€)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Competitors;
