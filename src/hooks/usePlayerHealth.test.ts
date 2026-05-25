import { act, renderHook } from "@testing-library/react";
import { usePlayerHealth } from "./usePlayerHealth";

describe("usePlayerHealth", () => {
  it("sets game over when health reaches 0", () => {
    const setIsGameOver = vi.fn();

    const { result } = renderHook(() =>
      usePlayerHealth({
        isGameOver: false,
        setIsGameOver,
        isPaused: false,
        position: { x: 0, y: 0 },
        enemies: [],
        setEnemies: vi.fn(),
      })
    );

    act(() => {
      result.current.setPlayerHealth(0);
    });

    expect(setIsGameOver).toHaveBeenCalledWith(true);
  });
});
