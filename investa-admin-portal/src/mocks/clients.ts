
import { Client } from '../types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'C-101', name: "Global Tech Solutions", email: "contact@globaltech.com", registrationDate: "2023-10-12", status: "Active", verificationPercent: 95, avatar: "https://picsum.photos/100/100?random=10" },
  { id: 'C-102', name: "Apex Marketing Group", email: "billing@apex.io", registrationDate: "2023-11-05", status: "Active", verificationPercent: 100, avatar: "https://picsum.photos/100/100?random=11" },
  { id: 'C-103', name: "Nebula Systems", email: "support@nebula.net", registrationDate: "2024-01-20", status: "Pending", verificationPercent: 45, avatar: "https://picsum.photos/100/100?random=12" },
  { id: 'C-104', name: "Quantum Logistics", email: "ops@quantum.com", registrationDate: "2023-08-15", status: "Suspended", verificationPercent: 88, avatar: "https://picsum.photos/100/100?random=13" },
  { id: 'C-105', name: "EcoFlow Energy", email: "hi@ecoflow.org", registrationDate: "2024-02-01", status: "Active", verificationPercent: 72, avatar: "https://picsum.photos/100/100?random=14" },
  { id: 'C-106', name: "Starlight Venture", email: "invest@starlight.co", registrationDate: "2023-12-28", status: "Inactive", verificationPercent: 15, avatar: "https://picsum.photos/100/100?random=15" },
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

    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://192.168.1.5:5235/';
    const url = `${base.replace(/\/+$/, '')}/api/v1/admin/clients/top`;
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
    // keep mocks if anything goes wrong
    // eslint-disable-next-line no-console
    console.debug('[mocks/clients] could not refresh top clients from API, using mock data', e);
  }
}

if (typeof window !== 'undefined') {
  // run in background without blocking module imports
  void refreshTopClientsFromApi();
}
