import type { Operator } from "@/types/operator";

export const MOCK_OPERATORS: Operator[] = [
  {
    id: "op-upsrtc",
    name: "UPSRTC",
    kind: "government",
    contact: { phone: "+91-1800-121-0080", website: "https://upsrtc.up.gov.in" },
    rating: 4.1,
  },
  {
    id: "op-cityline",
    name: "CityLine Express",
    kind: "private",
    contact: { phone: "+91-9876500001", email: "hello@cityline.in" },
    rating: 4.4,
  },
  {
    id: "op-heritage",
    name: "Heritage Travels",
    kind: "private",
    contact: { phone: "+91-9876500002", email: "care@heritagebus.in" },
    rating: 4.2,
  },
  {
    id: "op-greenway",
    name: "GreenWay E-Bus",
    kind: "private",
    contact: { phone: "+91-9876500003", website: "https://greenway.co.in" },
    rating: 4.6,
  },
  {
    id: "op-sangam",
    name: "Sangam Roadways",
    kind: "government",
    contact: { phone: "+91-1800-121-0090" },
    rating: 4.0,
  },
];
