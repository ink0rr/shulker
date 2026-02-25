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
  world: {
    sendMessage: mock((message) => message),
  },
}));
