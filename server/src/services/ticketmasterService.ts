import axios from 'axios';
import { config } from '../config/index.js';
import { EventSnapshot } from '../types/index.js';

interface TicketmasterSearchParams {
  city?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

interface CacheEntry {
  data: EventSnapshot[];
  expiresAt: number;
}

// In-memory cache with 2-minute TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 1000;

// Curated realistic fallback events when API key is omitted or for instant offline demos
const MOCK_EVENTS: EventSnapshot[] = [
  {
    id: "tm-ev-101",
    title: "Neon Pulse Electronic Music Festival",
    venue: "Brooklyn Mirage",
    date: "2026-10-05",
    time: "20:00",
    city: "New York",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-102",
    title: "Indie Rock Sunset Showcase",
    venue: "The Fillmore",
    date: "2026-10-08",
    time: "19:30",
    city: "San Francisco",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-103",
    title: "Cyberpunk Tech & AI Summit 2026",
    venue: "Metropolitan Pavilion",
    date: "2026-10-12",
    time: "09:00",
    city: "New York",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-104",
    title: "Midnight Jazz & Soul Sessions",
    venue: "Green Mill Cocktail Lounge",
    date: "2026-10-15",
    time: "21:00",
    city: "Chicago",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-105",
    title: "Global Street Food & Night Market",
    venue: "Presidio Parade Ground",
    date: "2026-10-18",
    time: "17:00",
    city: "San Francisco",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-106",
    title: "Underground Comedy Special: Live & Unfiltered",
    venue: "The Comedy Cellar",
    date: "2026-10-22",
    time: "21:30",
    city: "New York",
    imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-107",
    title: "Deep House Rooftop Experience",
    venue: "Cerise Rooftop",
    date: "2026-10-25",
    time: "18:00",
    city: "Chicago",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-108",
    title: "Modern Art & Light Installation Gala",
    venue: "SFMOMA",
    date: "2026-10-28",
    time: "19:00",
    city: "San Francisco",
    imageUrl: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  },
  {
    id: "tm-ev-109",
    title: "Synthwave After Dark",
    venue: "Webster Hall",
    date: "2026-10-31",
    time: "22:00",
    city: "New York",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    friendsAttendingCount: 0,
  }
];

export class TicketmasterService {
  /**
   * Fetches events with caching, Ticketmaster Discovery API integration, and mock fallback
   */
  public async fetchEvents(params: TicketmasterSearchParams): Promise<EventSnapshot[]> {
    const cacheKey = JSON.stringify({
      city: params.city?.trim().toLowerCase() || '',
      keyword: params.keyword?.trim().toLowerCase() || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
    });

    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    let results: EventSnapshot[] = [];

    // Attempt live Ticketmaster API if API key is present
    if (config.ticketmasterApiKey && config.ticketmasterApiKey.trim() !== '') {
      try {
        results = await this.queryTicketmasterApi(params);
      } catch (err: any) {
        console.warn('[TicketmasterService] Live API request failed, falling back to mock data:', err.message);
        results = this.filterMockEvents(params);
      }
    } else {
      results = this.filterMockEvents(params);
    }

    // Save to cache
    cache.set(cacheKey, {
      data: results,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return results;
  }

  private async queryTicketmasterApi(params: TicketmasterSearchParams): Promise<EventSnapshot[]> {
    const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const queryParams: Record<string, string> = {
      apikey: config.ticketmasterApiKey,
      sort: 'date,asc',
      size: '30',
    };

    if (params.city && params.city.trim()) {
      queryParams.city = params.city.trim();
    }
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim();
    }
    if (params.startDate) {
      queryParams.startDateTime = `${params.startDate}T00:00:00Z`;
    }
    if (params.endDate) {
      queryParams.endDateTime = `${params.endDate}T23:59:59Z`;
    }

    const response = await axios.get(url, { params: queryParams, timeout: 8000 });
    const rawEvents = response.data?._embedded?.events || [];

    return rawEvents.map((raw: any): EventSnapshot => {
      // Pick best image (prefer 16_9 or highest width)
      const images: any[] = raw.images || [];
      const bestImage =
        images.find((img) => img.ratio === '16_9' && img.width >= 600) ||
        images.sort((a, b) => (b.width || 0) - (a.width || 0))[0];

      const venueObj = raw._embedded?.venues?.[0];
      const venueName = venueObj?.name || 'TBA';
      const cityName = venueObj?.city?.name || params.city || 'Local';

      return {
        id: String(raw.id),
        title: raw.name || 'Untitled Event',
        venue: venueName,
        date: raw.dates?.start?.localDate || '',
        time: raw.dates?.start?.localTime ? raw.dates.start.localTime.substring(0, 5) : 'TBA',
        city: cityName,
        imageUrl: bestImage?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        friendsAttendingCount: 0,
      };
    });
  }

  private filterMockEvents(params: TicketmasterSearchParams): EventSnapshot[] {
    return MOCK_EVENTS.filter((ev) => {
      if (params.city && params.city.trim()) {
        const c = params.city.trim().toLowerCase();
        if (!ev.city.toLowerCase().includes(c)) return false;
      }
      if (params.keyword && params.keyword.trim()) {
        const kw = params.keyword.trim().toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(kw);
        const matchesVenue = ev.venue.toLowerCase().includes(kw);
        if (!matchesTitle && !matchesVenue) return false;
      }
      if (params.startDate && ev.date < params.startDate) {
        return false;
      }
      if (params.endDate && ev.date > params.endDate) {
        return false;
      }
      return true;
    });
  }
}

export const ticketmasterService = new TicketmasterService();
