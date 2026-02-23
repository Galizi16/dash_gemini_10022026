
export interface Hotel {
  id: string;
  hotel_id: string;
  code: string;
  name: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'user';
  email: string;
  hotel_id: string;
}

export interface DashboardConfig {
  widgets: {
    revenue: boolean;
    occupancy: boolean;
    pickup: boolean;
    adr: boolean;
    competitors: boolean;
    market: boolean;
    yieldRecommendations: boolean;
    alerts: boolean;
    events: boolean;
    bookingPace: boolean;
    rms: RMSConfig;
  };
}

export interface RMSConfig {
  hotelCapacity: number;
  roomTypeCapacities: Record<string, number>;
  strategy: 'aggressive' | 'balanced' | 'conservative';
  targetOccupancy: number;
  minAdr: number;
  maxAdr: number;
  minPrice: number;
  maxPrice: number;
  weekendPremiumPct: number;
  lastMinuteDiscountPct: number;
  demandWeight: number;
  competitorWeight: number;
  eventWeight: number;
  pickupWeight: number;
  priceStep: number;
  autoApproveThresholdPct: number;
}

export interface BookingExport {
  Reference: string;
  Etat: 'Confirmé' | 'Annulé' | 'Option';
  "Date d'arrivée": string;
  "Date de départ": string;
  "Date d'achat": string;
  "Date d'annulation"?: string;
  Chambres: number;
  Nuits: number;
  "Montant total": number;
  Origine: string;
  "Type de chambre": string;
  Adultes: number;
  Enfants: number;
  Pays: string;
}

export interface EventCalendar {
  Evenement: string;
  Debut: string;
  Fin: string;
  "Indice impact attendu sur la demande /10": number;
  Conseils_yield: string;
}

export interface BookingApercu {
  Date: string;
  "Votre hotel le plus bas": number;
  "mediane du compset": number;
  "Demande du marche": number;
}

export interface MetricLog {
  timestamp: string;
  scope: string;
  message: string;
  type: 'info' | 'error' | 'success';
}
