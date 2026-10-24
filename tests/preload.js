import { mock } from "bun:test";

mock.module("@minecraft/server", () => ({
  Direction: {
    Down: "Down",
    East: "East",
    North: "North",
    South: "South",
    Up: "Up",
    West: "West",
  },
  system: {
    run: mock(() => 0),
  },
  world: {
    sendMessage: mock((message) => message),
  },
}));
