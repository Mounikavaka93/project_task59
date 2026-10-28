import { photo } from "./images";

export const LOCATIONS = [
  { value: "all", label: "All destinations" },
  { value: "Goa", label: "Goa" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Kerala", label: "Kerala" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Udaipur", label: "Udaipur" },
  { value: "Manali", label: "Manali" },
  { value: "Delhi", label: "Delhi" },
  { value: "Bengaluru", label: "Bengaluru" },
];

export const DESTINATIONS = [
  {
    region: "Goa",
    blurb: "Sea air and slow mornings",
    image: photo("photo-1512343879784-a960bf40e7f2", 900),
  },
  {
    region: "Udaipur",
    blurb: "Lakes and late light",
    image: photo("photo-1439066615861-d1af74d74000", 900),
  },
  {
    region: "Kerala",
    blurb: "Canals and long verandas",
    image: photo("photo-1602216056096-3b40cc0c9944", 900),
  },
  {
    region: "Manali",
    blurb: "Cedar, stoves, and quiet",
    image: photo("photo-1464822759023-fed622ff2c3b", 900),
  },
];
