import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ className: "font-body", variable: "font-body-variable" }),
  Roboto_Condensed: () => ({ className: "font-display", variable: "font-display-variable" }),
}));

if (!("IntersectionObserver" in globalThis)) {
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: class {
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    },
    writable: true,
  });
}
