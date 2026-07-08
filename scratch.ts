import { MOCK_ROUTES } from "./src/data/routes.mock";
import { seedTrips } from "./src/data/trips.mock";
import { findDirectRoutes, computeRouteIntelligence } from "./src/services/intelligence/RouteIntelligenceEngine";
import { MOCK_BUSES } from "./src/data/buses.mock";
import { MOCK_OPERATORS } from "./src/data/operators.mock";

const MOCK_TRIPS = seedTrips();
const routes = findDirectRoutes("Prayagraj", "Delhi", MOCK_ROUTES);
console.log("Direct Routes:", routes.map(r => r.route.id));

const res = computeRouteIntelligence({
  fromQuery: "Prayagraj",
  toQuery: "Delhi",
  routes: MOCK_ROUTES,
  trips: MOCK_TRIPS,
  bus: (id) => MOCK_BUSES.find(b => b.id === id)!,
  operator: (id) => MOCK_OPERATORS.find(o => o.id === id)!,
  userLocation: null,
});

console.log("Direct Recommendations:", res.direct.length);
if (res.direct.length > 0) {
  res.direct.forEach(d => {
    console.log(`Trip: ${d.trip.tripId} | Route: ${d.route.id} | Status: ${d.status} | Score: ${d.score}`);
  });
}
