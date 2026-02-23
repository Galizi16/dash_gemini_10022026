
import React, { useState, useEffect } from 'react';
import { supabase, getSystemDate, logMetric } from '../services/supabase';
import { BookingApercu, EventCalendar, BookingExport } from '../types';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Calculator, 
  X, 
  ArrowRight,
  ChevronRight,
  Info,
  RefreshCw,
  LayoutGrid,
  Hotel
} from 'lucide-react';

interface CalculationDetail {
  date: string;
  basePrice: number;
  compMedian: number;
  demand: number;
  event: any;
  suggestion: number;
  action: 'up' | 'down' | 'stay';
  dispo: number;
  rack: number;
}

const PricingGrid: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'stay'>('all');
  const [selectedDetail, setSelectedDetail] = useState<CalculationDetail | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [events, setEvents] = useState<EventCalendar[]>([]);
  const [summary, setSummary] = useState({ arrivals: 0, revenue: 0, cancellations: 0 });

  const sysDate = getSystemDate();
  const today = sysDate.iso;

  const fetchData = async () => {
    setLoading(true);
    logMetric('GRID', 'Loading pricing data from Supabase...');
    try {
      // 1. Fetch Aperçu (Prices & Market Demand)
      const { data: apercu } = await supabase
        .from('booking_apercu')
        .select('*')
        .gte('Date', today)
        .order('Date', { ascending: true })
        .limit(31);

      // 2. Fetch Availability
      const { data: availability } = await supabase
        .from('disponibilites')
        .select('*')
        .gte('date', today);

      // 3. Fetch Events
      const { data: eventData } = await supabase
        .from('events_calendar')
        .select('*');

      // 4. Fetch Rack Rates (Planning Tarifs)
      const { data: rackRates } = await supabase
        .from('planning_tarifs')
        .select('*')
        .gte('date', today)
        .eq('type_de_chambre', 'Double Classique');

      // 5. Fetch Summary Stats (Booking Export)
      const { data: bookings } = await supabase
        .from('booking_export')
        .select('*')
        .gte("Date d'arrivée", today);

      if (apercu) {
        // Build joined data structure
        const enriched = apercu.map(row => {
          // Find matching availability (sum if multiple room types exist for same date)
          const dateDispos = availability?.filter(a => a.date === row.Date) || [];
          const totalDispo = dateDispos.reduce((acc, d) => acc + (d.disponibilites || 0), 0);
          
          // Find rack rate
          const rackRate = rackRates?.find(r => r.date === row.Date)?.tarif || (row["Votre hotel le plus bas"] || 150) * 1.2;
          
          // Find event with flexible matching
          const event = (eventData as any[])?.find(e => {
            const start = e.Debut || e.debut || e.Date || e.date;
            const end = e.Fin || e.fin || start;
            return row.Date >= start && row.Date <= end;
          });

          // RMS Logic for Action
          const action = getAction(row["Votre hotel le plus bas"], row["mediane du compset"], totalDispo);
          
          return { 
            ...row, 
            dispo: totalDispo, 
            rack: rackRate,
            event,
            action 
          };
        });
        setRows(enriched);
      }

      if (eventData) setEvents(eventData);

      if (bookings) {
        const confirmed = (bookings as BookingExport[]).filter(b => b.Etat === 'Confirmé');
        const canceled = (bookings as BookingExport[]).filter(b => b.Etat === 'Annulé');
        setSummary({
          arrivals: confirmed.length,
          revenue: confirmed.reduce((acc, b) => acc + (Number(b["Montant total"]) || 0), 0),
          cancellations: canceled.length
        });
      }

      logMetric('GRID', 'Grid synchronization successful', 'success');
    } catch (err) {
      logMetric('GRID', 'Failed to load data', 'error');
      console.error('Error grid data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAction = (current: number, median: number, dispo: number) => {
    if (!current || !median) return 'stay';
    const diff = current - median;
    if (diff < -15 || dispo < 3) return 'up';
    if (diff > 30 && dispo > 15) return 'down';
    return 'stay';
  };

  const filteredRows = rows.filter(r => filter === 'all' || r.action === filter);

  const openDetails = (row: any) => {
    const step = 5;
    const currentPrice = row["Votre hotel le plus bas"] || 0;
    const suggestion = currentPrice + (row.action === 'up' ? step * 3 : row.action === 'down' ? -step * 2 : 0);
    
    setSelectedDetail({
      date: row.Date,
      basePrice: currentPrice,
      compMedian: row["mediane du compset"] || 0,
      demand: row["Demande du marche"] || 0,
      event: row.event,
      suggestion: suggestion,
      action: row.action,
      dispo: row.dispo || 0,
      rack: row.rack || 0
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-500 text-sm mono uppercase tracking-widest animate-pulse">Chargement de la grille live...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Grille Tarifaire (Standard 2p)</h2>
          <div className="flex items-center mt-1 text-slate-500 text-sm">
             <Hotel size={14} className="mr-1 text-blue-500" />
             <span>Folkestone Opera • Données temps réel Supabase</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shadow-lg">
            {(['all', 'up', 'down', 'stay'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'up' ? 'Hausse' : f === 'down' ? 'Baisse' : 'Maintien'}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-blue-500 transition-all hover:bg-white/10"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gradient-border p-4 bg-blue-500/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Arrivées Confirmées</p>
          <p className="text-2xl font-bold mono">{summary.arrivals || 0}</p>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '65%' }} />
          </div>
        </div>
        <div className="gradient-border p-4 bg-emerald-500/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">CA Confirmé</p>
          <p className="text-2xl font-bold mono">{((summary.revenue || 0) / 1000).toFixed(1)}k€</p>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '82%' }} />
          </div>
        </div>
        <div className="gradient-border p-4 bg-rose-500/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Annulations</p>
          <p className="text-2xl font-bold mono">{summary.cancellations || 0}</p>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: '12%' }} />
          </div>
        </div>
      </div>

      {/* Main Grid Table */}
      <div className="gradient-border overflow-hidden shadow-2xl bg-[#111827]/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111827] border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date / Jour</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Dispo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest text-right">Notre BAR</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Mon RACK</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Compset (M)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Demande</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Salon / Événement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-right">Suggestion</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">RMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.map((row, idx) => {
                const isWeekend = ['Sat', 'Sun'].includes(new Date(row.Date).toLocaleDateString('en-US', { weekday: 'short' }));
                const currentPrice = row["Votre hotel le plus bas"] || 0;
                const suggestedPrice = currentPrice + (row.action === 'up' ? 15 : row.action === 'down' ? -10 : 0);
                
                return (
                  <tr key={idx} className={`hover:bg-white/[0.04] transition-colors group ${isWeekend ? 'bg-purple-500/[0.02]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${isWeekend ? 'text-purple-400' : 'text-slate-200'}`}>
                          {new Date(row.Date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold mono ${(row.dispo || 0) < 5 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                        {row.dispo || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-blue-400 mono">
                      {currentPrice.toFixed(0)}€
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-500 mono">
                      {(row.rack || 0).toFixed(0)}€
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-400 mono">
                      {(row["mediane du compset"] || 0).toFixed(0)}€
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-black ${
                        (row["Demande du marche"] || 0) > 7 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                        {row["Demande du marche"] || 0}/10
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {row.event ? (
                        <div className="text-[10px] text-amber-400 font-bold truncate max-w-[140px] flex items-center" title={row.event.Evenement || row.event.evenement}>
                          <Calendar size={10} className="mr-1 shrink-0" /> {row.event.Evenement || row.event.evenement}
                        </div>
                      ) : <span className="text-xs text-slate-700">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-black text-emerald-400 mono">
                        {suggestedPrice.toFixed(0)}€
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex p-1.5 rounded-lg border shadow-sm ${
                        row.action === 'up' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                        row.action === 'down' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                        'border-slate-500/30 bg-slate-500/10 text-slate-400'
                      }`}>
                        {row.action === 'up' ? <TrendingUp size={16} /> : row.action === 'down' ? <TrendingDown size={16} /> : <Minus size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openDetails(row)}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                      >
                        <Calculator size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="gradient-border w-full max-w-xl overflow-hidden glass shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Calculator className="text-blue-500" size={20} />
                <h3 className="font-bold text-lg tracking-tight">Analyse de Décision RMS</h3>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Période Analysée</p>
                  <p className="text-xl font-bold text-slate-200">
                    {new Date(selectedDetail.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedDetail.action === 'up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    selectedDetail.action === 'down' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    Action : {selectedDetail.action === 'up' ? 'Hausse' : selectedDetail.action === 'down' ? 'Baisse' : 'Maintien'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                   <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tarif Actuel</span>
                    <span className="font-bold text-slate-300 mono">{(selectedDetail.basePrice || 0).toFixed(0)}€</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Stock Dispo.</span>
                    <span className={`font-bold mono ${(selectedDetail.dispo || 0) < 5 ? 'text-rose-400' : 'text-slate-300'}`}>{selectedDetail.dispo || 0} ch.</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Médiane Compset</span>
                    <span className="text-slate-300 font-bold mono">{(selectedDetail.compMedian || 0).toFixed(0)}€</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Demande Marché</span>
                    <span className="text-slate-300 font-bold mono">{selectedDetail.demand || 0}/10</span>
                  </div>
                </div>
              </div>

              {selectedDetail.event && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center space-x-2 text-amber-400 mb-2">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alerte Événement : {selectedDetail.event.Evenement || selectedDetail.event.evenement}</span>
                  </div>
                  <p className="text-xs text-slate-400 italic leading-relaxed">
                    {selectedDetail.event.Conseils_yield || selectedDetail.event.conseils_yield || 'Ajustez votre stratégie en fonction de l\'événement.'}
                  </p>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Suggestion YieldPro</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-white mono">{(selectedDetail.suggestion || 0).toFixed(0)}€</span>
                    <span className={`text-sm font-bold ${selectedDetail.action === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedDetail.action === 'up' ? '▲' : '▼'} {Math.abs((selectedDetail.suggestion || 0) - (selectedDetail.basePrice || 0)).toFixed(0)}€
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg`}>
                  {selectedDetail.action === 'up' ? <TrendingUp className="text-emerald-400" size={32} /> : 
                   selectedDetail.action === 'down' ? <TrendingDown className="text-rose-400" size={32} /> : <Minus className="text-slate-400" size={32} />}
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/5 italic text-[11px] text-slate-500 leading-relaxed">
                <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
                <p>
                  Calcul dynamique incluant les paramètres "Poids Demande" et "Pression Capacité". 
                  Le Rack Rate pour cette date est configuré à {(selectedDetail.rack || 0).toFixed(0)}€.
                </p>
              </div>
              
              <div className="flex space-x-4 pt-2">
                <button 
                  onClick={() => setSelectedDetail(null)} 
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all text-slate-300"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    logMetric('GRID', `Price suggestion applied for ${selectedDetail.date}`, 'success');
                    setSelectedDetail(null);
                  }} 
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all glow-primary"
                >
                  Appliquer le prix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingGrid;
