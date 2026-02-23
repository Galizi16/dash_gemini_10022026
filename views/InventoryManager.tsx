
import React, { useEffect, useState } from 'react';
import { supabase, getSystemDate, logMetric } from '../services/supabase';
import { 
  XSquare, RefreshCw, AlertTriangle, CheckCircle2, 
  BedDouble, User, Calendar as CalendarIcon, ChevronDown, ChevronUp
} from 'lucide-react';

const InventoryManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [unavailabilities, setUnavailabilities] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const sysDate = getSystemDate();
  const today = sysDate.iso;

  const fetchData = async () => {
    setLoading(true);
    logMetric('INVENTORY', 'Fetching unavailabilities and stock levels...');
    try {
      const { data: dispos } = await supabase
        .from('disponibilites')
        .select('*')
        .gte('date', today)
        .or('ferme_a_la_vente.eq.x,disponibilites.eq.0')
        .order('date', { ascending: true });

      const { data: bookingData } = await supabase
        .from('booking_export')
        .select('*')
        .gte("Date d'arrivée", today)
        .limit(50);

      setUnavailabilities(dispos || []);
      setBookings(bookingData || []);
      logMetric('INVENTORY', 'Inventory data synchronized', 'success');
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
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mono">Analyse du stock physique...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mes Indisponibilités & Stock</h2>
          <p className="text-sm text-slate-500">Gestion des fermetures et surveillance du stock par type de chambre</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-all">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="gradient-border p-6 shadow-xl bg-[#111827]/40">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <AlertTriangle className="mr-2 text-rose-500" size={20} /> Alertes de fermeture (Stock 0 ou Fermé)
            </h3>
            <div className="space-y-3">
               {unavailabilities.length > 0 ? unavailabilities.slice(0, 10).map((u, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all group">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center font-bold text-rose-400">
                        {new Date(u.date).getDate()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{new Date(u.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{u.type_de_chambre}</p>
                      </div>
                   </div>
                   <div className="text-right">
                     <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${u.ferme_a_la_vente === 'x' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {u.ferme_a_la_vente === 'x' ? 'Fermé à la vente' : 'Stock Épuisé'}
                     </span>
                   </div>
                 </div>
               )) : (
                 <div className="text-center py-12">
                   <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                   <p className="text-sm text-slate-500">Aucune rupture de stock détectée sur l'horizon.</p>
                 </div>
               )}
            </div>
          </div>

          <div className="gradient-border p-6 shadow-xl">
             <h3 className="text-lg font-bold mb-6 flex items-center">
               <CalendarIcon className="mr-2 text-blue-500" size={20} /> Réservations critiques à venir
             </h3>
             <div className="overflow-hidden border border-white/5 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-500 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Réf</th>
                      <th className="px-4 py-3">Arrivée</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.slice(0, 8).map((b, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-white/[0.04] transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-200">{b.Reference}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(b["Date d'arrivée"]).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                          <td className="px-4 py-3 text-slate-500 italic">{b["Type de chambre"]}</td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => setExpandedBooking(expandedBooking === b.Reference ? null : b.Reference)}
                              className="p-1 hover:text-blue-400 transition-colors"
                            >
                              {expandedBooking === b.Reference ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </tr>
                        {expandedBooking === b.Reference && (
                          <tr className="bg-blue-600/[0.03]">
                            <td colSpan={4} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <div><span className="text-slate-200 block">Client</span> {b.Reference}</div>
                                <div><span className="text-slate-200 block">Nuits</span> {b.Nuits}</div>
                                <div><span className="text-slate-200 block">Origine</span> {b.Origine}</div>
                                <div><span className="text-slate-200 block">Total</span> {Number(b["Montant total"]).toFixed(2)}€</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="gradient-border p-6 shadow-xl bg-blue-600/5">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 border-b border-white/5 pb-2">Capacités Physiques</h4>
             <div className="space-y-6">
                {['Double Classique', 'Double Supérieure', 'Suite'].map((type, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-slate-300 flex items-center"><BedDouble size={14} className="mr-2 text-slate-500" /> {type}</span>
                       <span className="text-slate-500">20 ch.</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${80 - i*15}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="gradient-border p-6 shadow-xl flex flex-col items-center text-center">
             <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                <XSquare className="text-rose-500" size={24} />
             </div>
             <h4 className="text-sm font-bold mb-2">Fermeture Manuelle</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
               Besoin de bloquer une vente manuellement ? Utilisez l'outil Studio RMS pour forcer une fermeture physique.
             </p>
             <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
               Ouvrir Studio RMS
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
