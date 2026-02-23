
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { BookingExport } from '../types';
import { 
  ChevronLeft, ChevronRight, Filter, Download, UserCheck, 
  TrendingUp, RefreshCw, Info, Calendar as CalendarIcon 
} from 'lucide-react';

const CalendarArrivals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Aujourd'hui au lieu de Mars 2024
  const [bookings, setBookings] = useState<BookingExport[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data } = await supabase
        .from('booking_export')
        .select('*')
        .eq('Etat', 'Confirmé')
        .gte("Date d'arrivée", startOfMonth.split('T')[0])
        .lte("Date d'arrivée", endOfMonth.split('T')[0]);
      
      if (data) setBookings(data as BookingExport[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajuster pour que Lundi soit 0
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getDayArrivals = (day: number) => {
    const dStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b["Date d'arrivée"] === dStr);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mono">Analyse du calendrier...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendrier des Arrivées</h2>
          <p className="text-sm text-slate-500">Flux opérationnel pour {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
            <button onClick={handlePrevMonth} className="p-3 hover:bg-white/5 border-r border-white/10 transition-colors"><ChevronLeft size={18} /></button>
            <div className="px-6 py-2 text-sm font-bold min-w-[160px] text-center capitalize flex items-center justify-center">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={handleNextMonth} className="p-3 hover:bg-white/5 border-l border-white/10 transition-colors"><ChevronRight size={18} /></button>
          </div>
          <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-blue-500 transition-colors shadow-lg">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 gradient-border p-6 overflow-hidden">
          <div className="grid grid-cols-7 gap-px mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2 border-b border-white/5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 opacity-20" />
            ))}
            {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
              const day = i + 1;
              const dayArrivals = getDayArrivals(day);
              const totalAmount = dayArrivals.reduce((sum, b) => sum + (Number(b["Montant total"]) || 0), 0);
              const todayObj = new Date();
              const isToday = todayObj.getDate() === day && todayObj.getMonth() === currentMonth.getMonth() && todayObj.getFullYear() === currentMonth.getFullYear();

              return (
                <div key={day} className={`h-28 gradient-border p-2 cursor-pointer hover:border-blue-500/50 transition-all group ${isToday ? 'border-blue-500/80 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold transition-colors ${isToday ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'}`}>{day}</span>
                    {dayArrivals.length > 0 && (
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-500/20">
                        {dayArrivals.length}
                      </span>
                    )}
                  </div>
                  {dayArrivals.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-emerald-400 mono truncate">{totalAmount.toFixed(0)}€</p>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, dayArrivals.length * 15)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="gradient-border p-5 h-full">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center border-b border-white/5 pb-2">
              <UserCheck size={14} className="mr-2 text-blue-500" /> Flux d'arrivées confirmées
            </h4>
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
              {bookings.length > 0 ? bookings.slice(0, 15).map((b, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group hover:bg-white/[0.08]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">{b.Reference}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">{Number(b["Montant total"]).toFixed(0)}€</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{b["Type de chambre"]}</p>
                       <p className="text-[9px] text-slate-500 mt-0.5">{b.Origine} • {b.Nuits} nuits</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">{new Date(b["Date d'arrivée"]).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}</span>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-600 text-xs italic">
                  Aucune arrivée confirmée sur ce mois.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarArrivals;
