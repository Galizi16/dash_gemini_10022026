
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NAV_ITEMS, COLORS } from '../constants';
import { Menu, X, Bell, User, RefreshCw, Terminal, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logsOpen, setLogsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 90);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${today.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', { ...options, year: 'numeric' })}`;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload(); // Rechargement simple pour l'instant pour forcer le rafraîchissement Supabase
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out border-r border-white/5 bg-[#111827] flex flex-col z-20`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 glow-primary shrink-0">
            <span className="font-bold text-white">Y</span>
          </div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">YieldPro<span className="text-blue-500">RMS</span></span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'divider') {
              return <div key={item.id} className="my-4 border-t border-white/5" />;
            }
            
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path || '#'}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-medium' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className={`${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                  {item.icon}
                </div>
                {sidebarOpen && <span className="ml-3 text-sm truncate">{item.label}</span>}
                {sidebarOpen && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0d131f]/50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {sidebarOpen && <span className="ml-3 text-sm">Fermer menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-sm font-semibold text-slate-400 flex items-center">
                Hôtel : <span className="text-slate-100 ml-1">Folkestone Opera</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <CalendarIcon size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-300">{formatDateRange()}</span>
              <ChevronDown size={12} className="text-slate-500" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync: OK</span>
            </div>
            
            <button 
              onClick={handleRefresh}
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all ${refreshing ? 'animate-spin text-blue-500' : ''}`}
              title="Rafraîchir les données"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => setLogsOpen(!logsOpen)}
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all ${logsOpen ? 'text-blue-500 bg-blue-500/10' : ''}`}
              title="Logs techniques"
            >
              <Terminal size={20} />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0e17]" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">Jean Dupont</p>
                <p className="text-xs text-slate-500 mt-1 leading-none">Revenue Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            {children}
          </div>
        </div>

        {/* Metrics/Logs Drawer */}
        {logsOpen && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-[#111827]/95 backdrop-blur-xl border-t border-white/10 z-30 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-6 py-2 border-b border-white/5">
              <div className="flex items-center space-x-2 text-blue-400">
                <Terminal size={16} />
                <span className="text-xs font-bold uppercase tracking-widest mono">Console Metrics Logger</span>
              </div>
              <button onClick={() => setLogsOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 mono text-[11px]">
              <div className="text-slate-500">[{new Date().toLocaleTimeString()}] <span className="text-emerald-500">SYSTEM</span> Date du jour initialisée : {today.toLocaleDateString('fr-FR')}</div>
              <div className="text-slate-500">[{new Date().toLocaleTimeString()}] <span className="text-emerald-500">FETCH</span> Supabase connection established</div>
              <div className="text-slate-500">[{new Date().toLocaleTimeString()}] <span className="text-blue-500">CALC</span> Global date range updated: 90 days horizon</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
