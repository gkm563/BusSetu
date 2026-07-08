# 🚌 BusSetu (बससेतु / บัสเซตู)

> **Track Every Bus. Live.** | *प्रयागराज राजमार्गों पर लाइव बस ट्रैकिंग प्लेटफॉर्म*

**BusSetu** is a high-fidelity, real-time bus tracking and smart booking application optimized for the Prayagraj highway network. By integrating live GPS telemetry feeds, dynamic seat occupancy indicators, an interactive Leaflet map, and a multilingual AI advisor powered by Gemini, BusSetu makes highway travel smart, predictable, and stress-free.

---

## 🌟 Key Features

### 1. 🗺️ High-Contrast Live Map & Telemetry Markers
*   **Dynamic Custom Markers**: Rotated SVG bus indicators matching active headings.
*   **Dual Outline Contrasters**: A charcoal outer border (`rgba(15, 23, 42, 0.45)`) wraps the white border to ensure visibility on light and dark map tiles.
*   **Proximity Alerts**: Measures and displays distance to you, alerting you if the bus is heading **Towards You** or has **Passed**.
*   **Low Overhead**: Rotation and status adjustments are updated imperatively via direct element references, avoiding expensive React re-renders.

### 2. 🤖 Gemini AI Telemetry Advisor
*   **Multilingual Auto-Detection**: Type in English, Hindi, or Thai, and the AI advisor will automatically detect the language and switch translation state on the fly.
*   **Live Feeds Context**: Gemini 2.5 Flash analyzes live bus speeds, vacant seats, coordinates, and delays to provide recommendations.
*   **Interactive Clickable Badges**: Bus numbers in AI chats are clickable links (`[Bus Number](#bus-tripId)`). Clicking them selects the bus on the map and opens the details panel.

### 3. 💳 Smart Ticket Booking & Canvas Generator
*   **Dynamic Price Calculator**: Auto-calculates base rates (AC: ₹170, Regular: ₹120), optional AC upgrades (+₹50/seat), luggage protection (+₹30 flat), 5% GST, and flat convenience fees.
*   **Counter Management**: Dynamic `−` / `+` passenger rows that allocate seats (e.g. `1A`, `1B`) in real-time.
*   **Canvas Export Engine**: Draws custom vector passes with barcodes, notches, and tracking links using Canvas 2D API to avoid CSS gradient errors on exports. Downloads tickets directly to **PNG** and **PDF**.

### 4. 🌐 Real-Time Localization
*   Support for three languages: **English (🇺🇸)**, **Hindi (🇮🇳)**, and **Thai (🇹🇭)**.
*   Floating quick-change language pill placed next to the floating robot icon for instant translation switching.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: React 18 (TypeScript)
*   **Build System**: Vite
*   **State Store**: Zustand (decoupled high-frequency state updates)
*   **Mapping Layer**: Leaflet & React-Leaflet
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Styling**: Tailwind CSS + Custom CSS Variables
*   **AI Integration**: Gemini 2.5 Flash (Google Generative AI API)
*   **Exports**: jsPDF (PDF output)

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies using `npm` or `bun`:
```bash
npm install
# or
bun install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your Gemini API Key:
```env
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Running Development Server
Start the Vite local dev server:
```bash
npm run dev
# or
bun dev
```
Open `http://localhost:5173` in your browser.

---

## 📂 Project Architecture

```
src/
├── components/
│   ├── home/           # Main tracker layout wrappers
│   ├── layout/         # Navigation & header components
│   ├── map/            # Leaflet map rendering & custom SVGs
│   └── panels/         # Bus Details, AI Assistant drawer, booking sequences
├── hooks/              # Custom React hooks (translation, smart discover, geolocate)
├── services/           # Service adapters (mock telemetry, AI prompts)
├── store/              # Zustand stores (useLiveStore, useUiStore)
├── styles/             # Tailwind & custom CSS variables
└── utils/              # Helper libraries (coordinates, i18n maps, canvas ticket draws)
```

---

## 📄 License
This project is licensed under the MIT License.
