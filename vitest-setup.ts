/// <reference types="vitest/globals" />

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  value: vi.fn().mockResolvedValue(undefined),
});
