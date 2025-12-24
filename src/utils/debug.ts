import { world } from "@minecraft/server";

class ShulkerFormatter {
  protected colors = {
    string: "§a",
    number: "§6",
    null: "§8",
    boolean: "§9",
    undefined: "§8",
    key: "§7",
    reset: "§r",
    colon: "§7",
    brackets: ["§e", "§d", "§9"],
  };
  protected skipProperties = new Set([
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
  protected escape(string: string): string {
    return string
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }
  protected newLine(indent: number): string {
    return "\n" + "  ".repeat(indent);
  }
  protected compileArray(o: unknown[], options: FormatOptions = { indent: 1 }): string {
    const { indent, bracketIndex = 0, breaks = false, colored = true } = options;
    const hasObj = o.some((v) => typeof v === "object" && v !== null);
    const color = colored ? this.colors.brackets[bracketIndex % this.colors.brackets.length] : "";
    if (hasObj || breaks) {
      // Newlines
      return (
        color +
        "[" +
        this.newLine(indent + 1) +
        o
          .map((v) =>
            this.format(v, {
              indent: typeof v === "object" ? indent + 2 : indent,
              breaks: true,
              bracketIndex: bracketIndex + 1,
              colored,
              quoteString: true,
            }),
          )
          .join(`${this.colors.reset}, ` + this.newLine(indent + 1)) +
        this.newLine(indent) +
        color +
        "]" +
        this.colors.reset
      );
    } else {
      // No newlines
      return (
        color +
        "[" +
        o
          .map((v) =>
            this.format(v, {
              indent,
              bracketIndex: bracketIndex + 1,
              colored,
              quoteString: true,
            }),
          )
          .join(`${this.colors.reset}, `) +
        color +
        "]" +
        this.colors.reset
      );
    }
  }
  format(o: unknown, options: FormatOptions = { indent: 1 }): string {
    const { indent, breaks = true, bracketIndex = 0, colored = true } = options;
    let out = "";
    if (Array.isArray(o)) {
      // Array
      out += this.compileArray(o, { ...options, indent });
    } else if (typeof o === "object" && o !== null) {
      // Object
      let hasContent = false;
      const color = colored ? this.colors.brackets[bracketIndex % this.colors.brackets.length] : "";
      out += `${color}{${this.colors.reset}`;
      const keys = Object.keys(o).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(o)));
      for (const key of keys) {
        if (this.skipProperties.has(key)) {
          continue;
        }
        const compiled = this.format(o[key as keyof typeof o], {
          indent: indent + 1,
          breaks,
          bracketIndex: bracketIndex + 1,
          colored,
          quoteString: true,
        });
        if (compiled) {
          if (hasContent) {
            if (breaks) {
              out += ",";
            } else {
              out += ", ";
            }
          }
          if (breaks) {
            out += this.newLine(indent);
          }
          const str = this.escape(key);
          out += `${this.colors.key}${str}${this.colors.colon}:${this.colors.reset} ${compiled}`;
          hasContent = true;
        }
      }
      if (hasContent && breaks) {
        out += this.newLine(indent - 1);
      }
      out += `${color}}${this.colors.reset}`;
    } else if (o === null) {
      // Null
      const color = colored ? this.colors.null : "";
      out += `${color}null${this.colors.reset}`;
    } else if (typeof o === "string") {
      // String
      const color = colored ? this.colors.string : "";
      let str = this.escape(o);
      if (options.quoteString) {
        str = `${color}"${str}"`;
      }
      out += `${str}${this.colors.reset}`;
    } else if (typeof o === "number") {
      // Number
      const color = colored ? this.colors.number : "";
      out += `${color}${o}${this.colors.reset}`;
    } else if (typeof o === "boolean") {
      // Boolean
      const color = colored ? this.colors.boolean : "";
      out += `${color}${o}${this.colors.reset}`;
    } else if (typeof o === "undefined") {
      // Undefined
      const color = colored ? this.colors.undefined : "";
      out += `${color}undefined${this.colors.reset}`;
    } else if (typeof o === "bigint") {
      // BigInt
      const color = colored ? this.colors.number : "";
      out += `${color}${o}n${this.colors.reset}`;
    }
    return out;
  }
}

type FormatOptions = {
  indent: number;
  breaks?: boolean;
  bracketIndex?: number;
  colored?: boolean;
  quoteString?: boolean;
};

const formatter = new ShulkerFormatter();

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
  const formatted = args.map((v) => formatter.format(v)).join(" ");
  world.sendMessage(`[${method}] ${formatted}`);
}
