export const TAX_RATE = 0.12;
export const PRICE_MIN = 4000;
export const PRICE_MAX = 20000;
export const PRICE_STEP = 200;
export const MAX_GUESTS = 8;
export const MAX_NIGHTS = 30;
export const MAX_ROOMS = 4;
export const MAX_REQUEST_LENGTH = 240;
export const STORAGE_KEY = "marrowlane.bookings.v1";
export const ACCOUNTS_KEY = "marrowlane.accounts.v1";
export const SESSION_KEY = "marrowlane.session.v1";
export const DRAFT_KEY = "marrowlane.draft.v1";

export const DEMO_ACCOUNT = {
  name: "Asha Menon",
  email: "asha@marrowlane.demo",
  phone: "9876543210",
  password: "Marrowlane1",
};

export const DEMO_CARD = {
  name: "Asha Menon",
  number: "4242424242424242",
  expiry: "12/30",
  cvv: "123",
};

export const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Guest rating" },
];

export const RATING_FILTERS = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4.0 and up" },
  { value: 4.5, label: "4.5 and up" },
];
