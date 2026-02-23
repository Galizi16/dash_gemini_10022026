
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { RMSConfig, DashboardConfig } from '../types';
import { Settings as SettingsIcon, Save, RefreshCw, Layers, Sliders, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<RMSConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('dashboard_config').select('widgets').limit(1);
      if (data && data[0]?.widgets?.rms) {
        setConfig(data[0].widgets.rms);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate update logic for demo
    setTimeout(() => {
      setSaving(false);
      alert("Configuration sauvegardée avec succès (Simulé)");
    }, 1000);
  };

  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Studio RMS</h2>
          <p className="text-sm text-slate-500">Paramétrage global de l'algorithme YieldPro</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all glow-primary disabled:opacity-50"
        >
          {saving ? <RefreshCw size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="gradient-border p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center">
            <Sliders className="mr-2 text-blue-500" size={20} /> Stratégie & Objectifs
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stratégie Globale</label>
              <select className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors">
                <option value="balanced">Équilibrée</option>
                <option value="aggressive">Aggressive (ADR max)</option>
                <option value="conservative">Prudente (Occ max)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Occ. Cible (%)</label>
              <input type="number" defaultValue={85} className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ADR Min (€)</label>
              <input type="number" defaultValue={120} className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ADR Max (€)</label>
              <input type="number" defaultValue={450} className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="gradient-border p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center">
            <Layers className="mr-2 text-purple-500" size={20} /> Poids RMS (Algorithm)
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Poids Demande Marché', value: 40 },
              { label: 'Poids Concurrence', value: 30 },
              { label: 'Poids Événements', value: 20 },
              { label: 'Poids Pickup', value: 10 },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>{p.label}</span>
                  <span>{p.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 gradient-border p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <ShieldCheck className="mr-2 text-emerald-500" size={20} /> Capacités Physiques par Type de Chambre
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Double Classique', 'Double Supérieure', 'Suite Junior'].map((type, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-200">{type}</span>
                <input 
                  type="number" 
                  defaultValue={idx === 0 ? 20 : idx === 1 ? 15 : 10} 
                  className="w-16 bg-[#0a0e17] border border-white/10 rounded px-2 py-1 text-xs text-center font-bold text-blue-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
