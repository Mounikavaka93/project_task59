import { ACCOUNTS_KEY, DEMO_ACCOUNT, SESSION_KEY } from "./constants";
import { validateGuest } from "./validation";

function readList(storage, key) {
  try {
    const raw = storage?.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadAccounts(storage = globalThis.localStorage) {
  const accounts = readList(storage, ACCOUNTS_KEY).filter(
    (item) => item && typeof item.email === "string" && typeof item.password === "string"
  );
  if (accounts.some((item) => item.email === DEMO_ACCOUNT.email)) return accounts;
  return [...accounts, { ...DEMO_ACCOUNT }];
}

export function saveAccounts(accounts, storage = globalThis.localStorage) {
  storage?.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function loadSession(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.email !== "string" || typeof parsed.name !== "string") return null;
    return { name: parsed.name, email: parsed.email, phone: parsed.phone || "" };
  } catch {
    return null;
  }
}

export function saveSession(user, storage = globalThis.localStorage) {
  if (!user) storage?.removeItem(SESSION_KEY);
  else storage?.setItem(SESSION_KEY, JSON.stringify(user));
}

export function publicUser(account) {
  return { name: account.name, email: account.email, phone: account.phone || "" };
}

export function validateSignup({ name, email, phone, password, confirm }) {
  const errors = { ...validateGuest({ name, email, phone }) };
  if (!password || password.length < 8) errors.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Include a letter and a number.";
  }
  if (password !== confirm) errors.confirm = "Passwords do not match.";
  return errors;
}

export function validateSignIn({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}
