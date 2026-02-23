
import { BookingExport, BookingApercu, EventCalendar, DashboardConfig } from '../types';

export const mockHotels = [
  { id: '1', hotel_id: 'folkestone-opera', code: 'FO', name: 'Folkestone Opera' },
];

export const mockDashboardConfig: DashboardConfig = {
  widgets: {
    revenue: true,
    occupancy: true,
    pickup: true,
    adr: true,
    competitors: true,
    market: true,
    yieldRecommendations: true,
    alerts: true,
    events: true,
    bookingPace: true,
    rms: {
      hotelCapacity: 45,
      roomTypeCapacities: { 'Double Classique': 20, 'Double Supérieure': 15, 'Suite': 10 },
      strategy: 'balanced',
      targetOccupancy: 85,
      minAdr: 120,
      maxAdr: 450,
      minPrice: 90,
      maxPrice: 600,
      weekendPremiumPct: 15,
      lastMinuteDiscountPct: 10,
      demandWeight: 0.4,
      competitorWeight: 0.3,
      eventWeight: 0.2,
      pickupWeight: 0.1,
      priceStep: 5,
      autoApproveThresholdPct: 5
    }
  }
};

// Generate range of dates
const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = -10; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const dates = generateDates(90);

export const mockBookingApercu: BookingApercu[] = dates.map(date => ({
  Date: date,
  "Votre hotel le plus bas": 150 + Math.random() * 100,
  "mediane du compset": 160 + Math.random() * 120,
  "Demande du marche": Math.floor(Math.random() * 10)
}));

export const mockEvents: EventCalendar[] = [
  { 
    Evenement: 'Salon de l\'Agriculture', 
    Debut: dates[20], 
    Fin: dates[25], 
    "Indice impact attendu sur la demande /10": 8,
    Conseils_yield: 'Augmenter les prix de 15% minimum sur toute la plage.'
  },
  { 
    Evenement: 'Concert Taylor Swift', 
    Debut: dates[45], 
    Fin: dates[46], 
    "Indice impact attendu sur la demande /10": 10,
    Conseils_yield: 'Bloquer les tarifs au maximum, forte pression capacitaire.'
  }
];

export const mockBookingExport: BookingExport[] = Array.from({ length: 200 }).map((_, i) => {
  const arrDate = dates[Math.floor(Math.random() * dates.length)];
  const nights = 1 + Math.floor(Math.random() * 4);
  const depDateObj = new Date(arrDate);
  depDateObj.setDate(depDateObj.getDate() + nights);
  
  return {
    Reference: `BK-${1000 + i}`,
    Etat: Math.random() > 0.1 ? 'Confirmé' : 'Annulé',
    "Date d'arrivée": arrDate,
    "Date de départ": depDateObj.toISOString().split('T')[0],
    "Date d'achat": new Date(new Date(arrDate).getTime() - Math.random() * 1000 * 3600 * 24 * 30).toISOString().split('T')[0],
    Chambres: 1,
    Nuits: nights,
    "Montant total": 200 + Math.random() * 800,
    Origine: Math.random() > 0.5 ? 'Booking.com' : 'Expedia',
    "Type de chambre": 'Double Classique',
    Adultes: 2,
    Enfants: 0,
    Pays: 'France'
  };
});
