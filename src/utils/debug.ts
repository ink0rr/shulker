import { world } from "@minecraft/server";

const colors = {
  string: "§a",
  number: "§6",
  null: "§8",
  boolean: "§9",
  undefined: "§8",
  key: "§7",
  reset: "§r",
  colon: "§7",
  brackets: ["§e", "§d", "§9"],
} as const;
type ColorType = keyof typeof colors;
const skipProperties = new Set([
  "constructor",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toString",
  "valueOf",
  "__proto__",
  "toLocaleString",
]);

function escape(string: string): string {
  return string
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function newLine(indent: number): string {
  return "\n" + "  ".repeat(indent);
}

type WrapBracketsOptions = {
  type: "array" | "object";
  bracketIndex: number;
  colored?: boolean;
  str: string;
};
function wrapBrackets(options: WrapBracketsOptions): string {
  const { type, bracketIndex, colored, str } = options;
  const brackets = colors.brackets;
  const reset = colors.reset;
  const color = colored ? brackets[bracketIndex % brackets.length] : "";
  if (type === "array") {
    return color + "[" + str + color + "]" + reset;
  } else {
    return color + "{" + str + color + "}" + reset;
  }
}

type ColorizeOptions = {
  type: ColorType;
  str: string;
  colored?: boolean;
};
function colorize(options: ColorizeOptions): string {
  const { type, str, colored } = options;
  if (!colored) {
    return str;
  }
  const color = colors[type];
  const reset = colors.reset;
  return color + str + reset;
}

function* iterateKeys(o: object): Iterable<string> {
  const proto = Object.getPrototypeOf(o);
  if (proto === null) {
    return;
  }
  const keys = proto === Object.prototype
    ? Object.getOwnPropertyNames(o)
    : Object.getOwnPropertyNames(proto);
  for (const key of keys) {
    if (!skipProperties.has(key)) {
      yield key;
    }
  }
}

type FormatOptions = {
  indent: number;
  breaks?: boolean;
  bracketIndex?: number;
  colored?: boolean;
  quoteString?: boolean;
};
function formatArray(o: unknown[], options: FormatOptions): string {
  const { indent, breaks = true, bracketIndex = 0, colored = true } = options;
  let str = "";
  const innerOptions = {
    ...options,
    indent: indent + 1,
    bracketIndex: bracketIndex + 1,
  } satisfies FormatOptions;
  const n1 = newLine(indent + 1);
  for (let i = 0; i < o.length; i++) {
    const item = o[i];
    const compiled = format(item, innerOptions);
    if (breaks) {
      str += n1;
    }
    str += compiled;
    if (i < o.length - 1) {
      str += ",";
    }
  }
  if (breaks && str) {
    str += newLine(indent);
  }
  return wrapBrackets({
    type: "array",
    bracketIndex,
    colored,
    str,
  });
}
export function format(o: unknown, options: FormatOptions = { indent: 0 }): string {
  const { indent, breaks = true, bracketIndex = 0, colored = true, quoteString = true } = options;
  switch (typeof o) {
    case "string": {
      let str = escape(o);
      if (quoteString || !str) {
        str = `"${str}"`;
      }
      return colorize({ type: "string", str, colored });
    }
    case "number": {
      return colorize({ type: "number", str: o.toString(), colored });
    }
    case "boolean": {
      return colorize({ type: "boolean", str: o.toString(), colored });
    }
    case "bigint": {
      return colorize({ type: "number", str: o.toString() + "n", colored });
    }
    case "undefined": {
      return colorize({ type: "undefined", str: "undefined", colored });
    }
    case "object": {
      if (o === null) {
        return colorize({ type: "null", str: "null", colored });
      }
      if (Array.isArray(o)) {
        return formatArray(o, options);
      }
      let out = "";
      let hasContent = false;
      const innerOptions = {
        ...options,
        indent: indent + 1,
        bracketIndex: bracketIndex + 1,
      } satisfies FormatOptions;
      const n1 = newLine(indent + 1);
      for (const key of iterateKeys(o)) {
        const compiled = format(o[key as keyof typeof o], innerOptions);
        if (compiled) {
          if (hasContent) {
            if (breaks) {
              out += ",";
            } else {
              out += ", ";
            }
          }
          if (breaks) {
            out += n1;
          }
          const str = escape(key);
          const sKey = colorize({ type: "key", str, colored });
          const sColon = colorize({ type: "colon", str: ":", colored });
          out += `${sKey}${sColon} ${compiled}`;
          hasContent = true;
        }
      }
      if (hasContent && breaks) {
        out += newLine(indent);
      }
      return wrapBrackets({
        type: "object",
        bracketIndex,
        colored,
        str: out,
      });
    }
  }
  return "";
}

/**
 * A simple debugging utility for logging messages to the Minecraft chat.
 * Messages are prefixed with their log level and formatted for readability.
 *
 * @example
 * ```ts
 * import { debug } from "shulker";
 * debug.log("This is a log message", { some: "object", value: 42 });
 * debug.info("This is an info message");
 * debug.warn("This is a warning message");
 * debug.error("This is an error message");
 * debug.run(() => {
 *   // Code that may throw an error
 * });
 * ```
 */
export const debug = Object.freeze({
  log(...args: unknown[]) {
    DEBUG: impl("§aLOG§r", ...args);
  },
  info(...args: unknown[]) {
    DEBUG: impl("§9INFO§r", ...args);
  },
  warn(...args: unknown[]) {
    DEBUG: impl("§eWARN§r", ...args);
  },
  error(...args: unknown[]) {
    DEBUG: impl("§cERROR§r", ...args);
  },
  run(callback: () => void) {
    DEBUG: try {
      callback();
    } catch (e) {
      debug.error(e);
    }
  },
});

function impl(method: string, ...args: unknown[]) {
  const formatted = args.map((v) => format(v)).join(" ");
  world.sendMessage(`[${method}] ${formatted}`);
}
