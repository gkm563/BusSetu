import { useLiveStore } from "@/store/useLiveStore";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const AiChatService = {
  getSystemContext(userLocation: { lat: number; lng: number } | null, languageCode: string = "en") {
    const live = useLiveStore.getState();
    const activeTrips = live.tripIdList.map((id) => {
      const t = live.tripsById[id];
      const bus = live.busesById[t?.busId ?? ""];
      const r = live.routesById[t?.routeId ?? ""];
      return {
        tripId: t?.tripId,
        busNumber: bus?.busNumber,
        operator: live.operatorsById[bus?.operatorId ?? ""]?.name,
        routeName: r?.name,
        status: t?.status,
        speedKmh: t ? Math.round(t.gps.speed) : 0,
        vacantSeats: t?.passenger.vacantSeats ?? 0,
        occupiedSeats: t?.passenger.occupiedSeats ?? 0,
        standingPassengers: t?.passenger.standingPassengers ?? 0,
        delayMin: t?.delay ?? 0,
        progress: t ? Math.round(t.routeProgress * 100) : 0,
        nextStop: r?.stops.find((s) => s.id === t?.nextStopId)?.name,
      };
    });

    const stops = Object.values(live.stopsById).map((s) => ({
      name: s.name,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
    }));

    const langMap: Record<string, string> = { en: "English", hi: "Hindi", th: "Thai" };
    const langName = langMap[languageCode] || "English";

    return `
You are BusSetu AI, a smart transit advisor tracking real-time Prayagraj highway telemetries.
User Location: ${userLocation ? `Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng} (Prayagraj Region)` : "Unknown"}
Active Live Buses: ${JSON.stringify(activeTrips)}
Stops Catalog: ${JSON.stringify(stops)}

Instructions:
- Provide accurate recommendations based on live seats counts, speed metrics, delay counts, and coordinates.
- If the user asks about travel times or walking durations, calculate walking ETAs assuming average walking speed is 4.8 km/h.
- Be helpful, conversational, and highly informative. Feel free to use list bullet formatting, speed comparisons, and recommendations.
- CRITICAL: Whenever you mention a bus (e.g. by bus number like "UP70 AB 1234"), you MUST format it as a markdown link with its tripId, in the format: [Bus Number](#bus-tripId). For example, write "[UP70 AB 1234](#bus-TRIP-102)" instead of just the bus number. This is extremely important so the user can click it to open details.
- CRITICAL: You MUST reply entirely in the same language as user prompt. Currently requested response language is: ${langName}. If the user language is Hindi (including Devanagari script), reply in fluent Hindi. If it is Thai, reply in Thai script. Do NOT use English unless the selected language or input query is in English.
`;
  },

  async askAi(prompt: string, userLocation: { lat: number; lng: number } | null, history: ChatMessage[], languageCode: string = "en") {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key || key === "YOUR_API_KEY_HERE") {
      throw new Error(
        "API Key is missing! If you are testing locally, please restart your Vite dev server so it can read the .env.local file. If you are on Vercel, please ensure VITE_GEMINI_API_KEY is set in your environment variables and trigger a new deployment."
      );
    }

    // Auto-detect prompt language from characters to dynamic matching
    let detectedLang = languageCode;
    if (/[\u0900-\u097F]/.test(prompt)) {
      detectedLang = "hi";
    } else if (/[\u0e00-\u0e7f]/.test(prompt)) {
      detectedLang = "th";
    } else if (/[a-zA-Z]/.test(prompt)) {
      // If there are English characters, default response language to English
      detectedLang = "en";
    }

    const context = this.getSystemContext(userLocation, detectedLang);

    // Format history for Gemini API
    const contents = [
      ...history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: context }] },
        contents,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData?.error?.message || "Failed to consult Gemini API");
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't process that request right now.";
  }
};
