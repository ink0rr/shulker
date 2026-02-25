import { TimeOfDay, system, world } from "@minecraft/server";

type TimeEventHandler = (time: TimeOfDay, initial: boolean) => void;
let handlerList: TimeEventHandler[];
let prev = -1;

function registerEvents() {
  system.runInterval(() => {
    const current = getTimeOfDay();
    if (prev === current) {
      return;
    }
    for (const handler of handlerList) {
      handler(current, prev === -1);
    }
    prev = current;
  });
}

export const timeEvents = {
  /**
   * Subscribes to time of day changes.
   * @param callback Code to run when the time of day changed. Note a second argument to indicate if the event is running when you first join the world.
   */
  subscribe(callback: TimeEventHandler) {
    if (!handlerList) {
      handlerList = [];
      system.run(registerEvents);
    }
    handlerList.push(callback);
  },
  unsubscribe(callback: TimeEventHandler) {
    handlerList.filter((cb) => cb !== callback);
  },
} as const;

/**
 * Get the current time of day as TimeOfDay enum.
 */
export function getTimeOfDay() {
  const time = world.getTimeOfDay();
  if (time >= TimeOfDay.Sunrise) {
    return TimeOfDay.Sunrise;
  }
  if (time >= TimeOfDay.Midnight) {
    return TimeOfDay.Midnight;
  }
  if (time >= TimeOfDay.Night) {
    return TimeOfDay.Night;
  }
  if (time >= TimeOfDay.Sunset) {
    return TimeOfDay.Sunset;
  }
  if (time >= TimeOfDay.Noon) {
    return TimeOfDay.Noon;
  }
  if (time >= TimeOfDay.Day) {
    return TimeOfDay.Day;
  }
  return TimeOfDay.Sunrise;
}
