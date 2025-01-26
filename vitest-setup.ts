import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock the play method
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  value: vi.fn().mockResolvedValue(undefined),
});
