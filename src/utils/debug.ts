import { world } from "@minecraft/server";
import { format } from "./formatter.js";

export const debug = Object.freeze({
  log(...args: unknown[]) {
    DEBUG: impl("LOG", ...args);
  },
  info(...args: unknown[]) {
    DEBUG: impl("INFO", ...args);
  },
  warn(...args: unknown[]) {
    DEBUG: impl("WARN", ...args);
  },
  error(...args: unknown[]) {
    impl("ERROR", ...args);
  },
  run(callback: () => void) {
    DEBUG: try {
      callback();
    } catch (e) {
      impl("ERROR", e);
    }
  },
});

function impl(method: Uppercase<keyof typeof debug>, ...args: unknown[]) {
  const formatted = args.map((v) => format(v, { indent: 1 })).join(" ");
  const methodStr = method.toUpperCase();
  world.sendMessage(`[${methodStr}] ${formatted}`);
}
