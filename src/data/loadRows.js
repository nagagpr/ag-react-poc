import { createSampleOrders } from './sampleData';

// Set VITE_API_URL (see .env.example) to load rows from an API such as FastAPI.
// Vite bakes this value in at build time, so rebuild after changing it.
const apiUrl = import.meta.env.VITE_API_URL;

export const dataSource = apiUrl ? `API (${apiUrl})` : 'Built-in sample data';

export async function loadRows() {
  if (!apiUrl) {
    return createSampleOrders(500);
  }
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API returned HTTP ${response.status}`);
  }
  return response.json();
}
