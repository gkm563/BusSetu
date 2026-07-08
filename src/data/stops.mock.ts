import type { Stop } from "@/types/stop";

export const MOCK_STOPS: Stop[] = [
  // Prayagraj ↔ Lucknow Route Stops
  { id: "s-prayagraj", name: "Prayagraj Bus Stand", city: "Prayagraj", lat: 25.4484, lng: 81.8247 },
  { id: "s-phulpur", name: "Phulpur Station", city: "Phulpur", lat: 25.5539, lng: 82.0911 },
  { id: "s-pratapgarh", name: "Pratapgarh Junction", city: "Pratapgarh", lat: 25.8975, lng: 81.9500 },
  { id: "s-amethi", name: "Amethi Bus Stand", city: "Amethi", lat: 26.1558, lng: 81.8105 },
  { id: "s-raebareli", name: "Rae Bareli Bus Station", city: "Rae Bareli", lat: 26.2235, lng: 81.2403 },
  { id: "s-bachhrawan", name: "Bachhrawan Stop", city: "Bachhrawan", lat: 26.4754, lng: 81.2294 },
  { id: "s-lucknow", name: "Lucknow Charbagh Station", city: "Lucknow", lat: 26.8315, lng: 80.9157 },

  // Lucknow ↔ Delhi & Delhi ↔ Prayagraj Route Stops
  { id: "s-unnao", name: "Unnao Junction", city: "Unnao", lat: 26.4678, lng: 80.4856 },
  { id: "s-kanpur", name: "Kanpur Central Bus Stand", city: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { id: "s-etawah", name: "Etawah Bus Terminus", city: "Etawah", lat: 26.7776, lng: 79.0300 },
  { id: "s-agra", name: "Agra ISBT", city: "Agra", lat: 27.1767, lng: 78.0081 },
  { id: "s-mathura", name: "Mathura Bus Stand", city: "Mathura", lat: 27.4924, lng: 77.6737 },
  { id: "s-delhi", name: "Delhi Kashmiri Gate ISBT", city: "Delhi", lat: 28.6675, lng: 77.2282 },
  { id: "s-fatehpur", name: "Fatehpur Bus Stand", city: "Fatehpur", lat: 25.9326, lng: 80.8252 },

  // Legacy stops for compatibility/other popular queries
  { id: "s-allahabad-civil", name: "Prayagraj Civil Lines", city: "Prayagraj", lat: 25.4589, lng: 81.8462 },
  { id: "s-naini", name: "Naini Junction", city: "Prayagraj", lat: 25.3894, lng: 81.8712 },
  { id: "s-karchana", name: "Karchana", city: "Prayagraj", lat: 25.2811, lng: 81.9401 },
  { id: "s-meja", name: "Meja Road", city: "Prayagraj", lat: 25.1650, lng: 82.1200 },
  { id: "s-vindhyachal", name: "Vindhyachal", city: "Mirzapur", lat: 25.1400, lng: 82.4900 },
  { id: "s-mirzapur", name: "Mirzapur Bus Stand", city: "Mirzapur", lat: 25.1449, lng: 82.5687 },
  { id: "s-varanasi-cantt", name: "Varanasi Cantt", city: "Varanasi", lat: 25.3268, lng: 82.9871 },
  { id: "s-bhadohi", name: "Bhadohi", city: "Bhadohi", lat: 25.3931, lng: 82.5687 },
  { id: "s-gyanpur", name: "Gyanpur", city: "Bhadohi", lat: 25.2500, lng: 82.6500 },
  { id: "s-lucknow-alambagh", name: "Alambagh ISBT", city: "Lucknow", lat: 26.8067, lng: 80.9080 },
];
