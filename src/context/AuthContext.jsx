import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadAccounts, loadSession, publicUser, saveAccounts, saveSession } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadAccounts());
  const [user, setUser] = useState(() => loadSession());

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveSession(user);
  }, [user]);

  const signIn = useCallback(
    (email, password) => {
      const account = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!account || account.password !== password) {
        return { ok: false, error: "Those details don't match an account on this device." };
      }
      setUser(publicUser(account));
      return { ok: true };
    },
    [accounts]
  );

  const signUp = useCallback(
    (details) => {
      const email = details.email.trim().toLowerCase();
      if (accounts.some((item) => item.email.toLowerCase() === email)) {
        return { ok: false, error: "An account with this email already exists. Sign in instead." };
      }
      const account = {
        name: details.name.trim(),
        email,
        phone: details.phone.replace(/\D/g, ""),
        password: details.password,
      };
      setAccounts((current) => [...current, account]);
      setUser(publicUser(account));
      return { ok: true };
    },
    [accounts]
  );

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
