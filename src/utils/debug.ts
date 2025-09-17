import { world } from "@minecraft/server";
import { format } from "./formatter.js";

export const debug = Object.freeze({
  log(...args: unknown[]) {
    DEBUG: impl("log", ...args);
  },
  info(...args: unknown[]) {
    DEBUG: impl("info", ...args);
  },
  warn(...args: unknown[]) {
    DEBUG: impl("warn", ...args);
  },
  error(...args: unknown[]) {
    impl("error", ...args);
  },
  run(callback: () => void) {
    DEBUG: try {
      callback();
    } catch (e) {
      impl("error", e);
    }
  },
});

function impl(method: keyof typeof debug, ...args: unknown[]) {
  const formatted = args.map((v) => format(v, { indent: 1 })).join(" ");
  const methodStr = method.toUpperCase();
  world.sendMessage(`[${methodStr}] ${formatted}`);
}
