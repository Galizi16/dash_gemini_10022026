
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load views for better performance
const Dashboard = lazy(() => import('./views/Dashboard'));
const PricingGrid = lazy(() => import('./views/PricingGrid'));
const Simulator = lazy(() => import('./views/Simulator'));
const Competitors = lazy(() => import('./views/Competitors'));
const CalendarArrivals = lazy(() => import('./views/CalendarArrivals'));
const Settings = lazy(() => import('./views/Settings'));
const YieldAnalysis = lazy(() => import('./views/YieldAnalysis'));
const InventoryManager = lazy(() => import('./views/InventoryManager'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0a0e17]">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin glow-primary mb-4" />
      <span className="text-xs font-bold tracking-widest text-slate-500 uppercase mono">Initialisation YieldPro...</span>
    </div>
  </div>
);

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-40">
    <h2 className="text-3xl font-bold tracking-tighter mb-4">{title}</h2>
    <p className="max-w-md text-center text-slate-400">Ce module est en cours de développement ou nécessite une connexion aux données temps réel.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grid" element={<PricingGrid />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/calendar-arrivals" element={<CalendarArrivals />} />
            <Route path="/reservation-simulator" element={<Simulator />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/yield" element={<YieldAnalysis />} />
            <Route path="/mes-indisponibilites" element={<InventoryManager />} />
            
            <Route path="/admin" element={<PlaceholderView title="Administration" />} />
            <Route path="/help-general" element={<PlaceholderView title="Aide Générale" />} />
            <Route path="/help-calibrage" element={<PlaceholderView title="Aide au Calibrage" />} />
            <Route path="/history" element={<PlaceholderView title="Historique" />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;
