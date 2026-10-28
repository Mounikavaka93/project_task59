import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

Object.defineProperty(window, "scrollTo", { configurable: true, value: () => {} });

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  });
}
Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: () => {} });

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
