
import React from 'react';
import { 
  LayoutDashboard, 
  Grid3X3, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  XSquare, 
  Calculator, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  History,
  Users
} from 'lucide-react';

export const COLORS = {
  bg: '#0a0e17',
  surface: '#111827',
  primary: '#3b82f6',
  success: '#10b981',
  accent: '#8b5cf6',
  danger: '#ef4444',
  warning: '#f59e0b',
  slate: '#94a3b8'
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { id: 'grid', label: 'Grille Tarifaire', icon: <Grid3X3 size={20} />, path: '/grid' },
  { id: 'competitors', label: 'Concurrence', icon: <TrendingUp size={20} />, path: '/competitors' },
  { id: 'yield', label: 'Analyses Yield', icon: <BarChart3 size={20} />, path: '/yield' },
  { id: 'calendar-arrivals', label: 'Calendrier Arrivees', icon: <Calendar size={20} />, path: '/calendar-arrivals' },
  { id: 'mes-indisponibilites', label: 'Mes indisponibilites', icon: <XSquare size={20} />, path: '/mes-indisponibilites' },
  { id: 'reservation-simulator', label: 'Simulateur', icon: <Calculator size={20} />, path: '/reservation-simulator' },
  { id: 'divider-1', type: 'divider' },
  { id: 'help-general', label: 'Aide Generale', icon: <HelpCircle size={20} />, path: '/help-general' },
  { id: 'help-calibrage', label: 'Aide Calibrage', icon: <ShieldAlert size={20} />, path: '/help-calibrage' },
  { id: 'history', label: 'Historique', icon: <History size={20} />, path: '/history' },
  { id: 'settings', label: 'Studio RMS', icon: <Settings size={20} />, path: '/settings' },
  { id: 'admin', label: 'Admin', icon: <Users size={20} />, path: '/admin', adminOnly: true },
];

export const ROOM_TYPES = [
  'Double Classique',
  'Double Supérieure',
  'Chambre Twin',
  'Suite Junior',
  'Suite Exécutive'
];

export const OTAS = [
  { id: 'booking', name: 'Booking.com', commission: 0.17 },
  { id: 'expedia', name: 'Expedia', commission: 0.18 },
  { id: 'direct', name: 'Site Direct', commission: 0.00 },
  { id: 'hotelbeds', name: 'Hotelbeds', commission: 0.15 }
];
