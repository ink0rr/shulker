import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";

type ScriptEventHandler = (event: ScriptEventCommandMessageAfterEvent) => void;
let events: Map<string, ScriptEventHandler>;

function registerEvents() {
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    events.get(event.id)?.(event);
  });
}

export const scriptEvents = {
  /**
   * Subscribe to a scriptevent
   * @param id Scriptevent id
   * @param handler Event handler
   */
  subscribe(id: string, handler: ScriptEventHandler) {
    if (!events) {
      events = new Map();
      system.run(registerEvents);
    }
    if (events.has(id)) {
      throw new Error(`ScriptEvent '${id}' already exists.`);
    }
    events.set(id, handler);
  },
  /**
   * Unsubscribe from a scriptevent
   * @param id Scriptevent id
   */
  unsubscribe(id: string) {
    events?.delete(id);
  },
} as const;
