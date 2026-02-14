
import { Client } from '../types';
import { getDynamicBaseUrl } from '../utils/environment';

/** Default avatar placeholder - uses UI Avatars service for initials-based avatars */
const getDefaultAvatar = (name: string, seed: number) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=100`;

export const MOCK_CLIENTS: Client[] = [
  { id: 'C-101', name: "Global Tech Solutions", email: "contact@globaltech.com", registrationDate: "2023-10-12", status: "Active", verificationPercent: 95, avatar: getDefaultAvatar("Global Tech", 10) },
  { id: 'C-102', name: "Apex Marketing Group", email: "billing@apex.io", registrationDate: "2023-11-05", status: "Active", verificationPercent: 100, avatar: getDefaultAvatar("Apex Marketing", 11) },
  { id: 'C-103', name: "Nebula Systems", email: "support@nebula.net", registrationDate: "2024-01-20", status: "Pending", verificationPercent: 45, avatar: getDefaultAvatar("Nebula Systems", 12) },
  { id: 'C-104', name: "Quantum Logistics", email: "ops@quantum.com", registrationDate: "2023-08-15", status: "Suspended", verificationPercent: 88, avatar: getDefaultAvatar("Quantum Logistics", 13) },
  { id: 'C-105', name: "EcoFlow Energy", email: "hi@ecoflow.org", registrationDate: "2024-02-01", status: "Active", verificationPercent: 72, avatar: getDefaultAvatar("EcoFlow Energy", 14) },
  { id: 'C-106', name: "Starlight Venture", email: "invest@starlight.co", registrationDate: "2023-12-28", status: "Inactive", verificationPercent: 15, avatar: getDefaultAvatar("Starlight Venture", 15) },
];

export let TOP_SCORED_CLIENTS: Client[] = [...MOCK_CLIENTS]
  .sort((a, b) => b.verificationPercent - a.verificationPercent)
  .slice(0, 5);

// Try to refresh `TOP_SCORED_CLIENTS` from the live backend when running in the browser
// - honors `VITE_USE_MOCKS=true` or `localStorage.useMocks === 'true'` to keep mocks
// - safe-fails back to the static mock list on any network/shape error
async function refreshTopClientsFromApi() {
  try {
    const envUse = import.meta.env.VITE_USE_MOCKS;
    if (envUse === 'true') return;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('useMocks');
      if (stored === 'true') return;
    }

    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://desktop-dih7cqh:5235/';
    // Normalize base and strip any trailing `/api` segment to avoid duplicated `/api/api` when
    // VITE_API_BASE_URL is configured as e.g. `http://localhost:5000/api` (common in docs/examples)
    const baseClean = base.replace(/\/api\/?$/, '').replace(/\/+$|\s+$/g, '');
    const url = `${baseClean}/api/v1/admin/clients/top`;
    const resp = await fetch(url, { credentials: 'include' });
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const json = await resp.json();
    const arr = json?.data ?? json;
    if (Array.isArray(arr) && arr.length) {
      TOP_SCORED_CLIENTS = [...arr]
        .sort((a: Client, b: Client) => b.verificationPercent - a.verificationPercent)
        .slice(0, 5);
    }
  } catch (e) {
    // keep mocks if anything goes wrong - only log in development
    if (import.meta.env.DEV) {
      console.debug('[mocks/clients] could not refresh top clients from API, using mock data', e);
    }
  }
}

if (typeof window !== 'undefined') {
  // run in background without blocking module imports
  void refreshTopClientsFromApi();
}
