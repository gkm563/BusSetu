import { useLiveStore } from "@/store/useLiveStore";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const AiChatService = {
  getSystemContext(userLocation: { lat: number; lng: number } | null) {
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

    return `
You are the BusSetu AI Assistant, a smart transit advisor tracking real-time Prayagraj highway telemetries.
User Location: ${userLocation ? `Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng} (Prayagraj Region)` : "Unknown"}
Active Live Buses: ${JSON.stringify(activeTrips)}
Stops Catalog: ${JSON.stringify(stops)}

Instructions:
- Provide accurate recommendations based on live seats counts, speed metrics, delay counts, and coordinates.
- If the user asks about travel times or walking durations, calculate walking ETAs assuming average walking speed is 4.8 km/h.
- Be concise (2-4 sentences max per response). Keep it friendly and conversational.
`;
  },

  async askAi(prompt: string, userLocation: { lat: number; lng: number } | null, history: ChatMessage[]) {
    const key = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
    const context = this.getSystemContext(userLocation);

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
