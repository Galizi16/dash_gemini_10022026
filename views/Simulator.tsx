
import React, { useState } from 'react';
import { OTAS, ROOM_TYPES } from '../constants';
import { Calculator, ArrowRight, Euro, Info, History } from 'lucide-react';

const Simulator: React.FC = () => {
  const [ota, setOta] = useState(OTAS[0]);
  const [roomType, setRoomType] = useState(ROOM_TYPES[0]);
  const [basePrice, setBasePrice] = useState(150);
  const [nights, setNights] = useState(2);
  const [discount, setDiscount] = useState(0);

  const brutTotal = basePrice * nights;
  const discountAmount = (brutTotal * discount) / 100;
  const netBeforeCommission = brutTotal - discountAmount;
  const commission = netBeforeCommission * ota.commission;
  const netToHotel = netBeforeCommission - commission;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Simulateur de Réservation</h2>
        <p className="text-sm text-slate-500">Calculateur de rentabilité nette par canal (OTA / Direct)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="gradient-border p-6 space-y-6">
          <h3 className="font-bold flex items-center">
            <Calculator className="mr-2 text-blue-500" size={20} /> Paramètres de Simulation
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Canal / OTA</label>
              <select 
                className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                onChange={(e) => setOta(OTAS.find(o => o.id === e.target.value) || OTAS[0])}
              >
                {OTAS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prix par nuit (€)</label>
                <input 
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre de nuits</label>
                <input 
                  type="number"
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Remise Exceptionnelle (%)</label>
              <input 
                type="range"
                min="0" max="50" step="5"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0%</span>
                <span>{discount}%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="gradient-border p-6 bg-blue-600/5">
          <h3 className="font-bold flex items-center mb-6">
            <Euro className="mr-2 text-emerald-500" size={20} /> Estimation de Revenu Net
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-slate-400">Total Brut ({nights} nuits)</span>
              <span className="font-bold text-slate-200">{brutTotal.toFixed(2)}€</span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-slate-400">Remise ({discount}%)</span>
              <span className="font-bold text-rose-400">-{discountAmount.toFixed(2)}€</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center">
                <span className="text-sm text-slate-400">Com. {ota.name}</span>
                <span className="ml-2 text-[10px] text-slate-500">({(ota.commission * 100).toFixed(0)}%)</span>
              </div>
              <span className="font-bold text-rose-400">-{commission.toFixed(2)}€</span>
            </div>

            <div className="h-px bg-white/10 my-6" />

            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Net Estimé (Encaissement)</p>
              <p className="text-5xl font-bold text-white mono">{netToHotel.toFixed(2)}€</p>
              <p className="text-[10px] text-slate-500 mt-2">ADR Net : {(netToHotel/nights).toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
