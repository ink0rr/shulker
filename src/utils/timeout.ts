import { system } from "@minecraft/server";

const runIds = new Map<string, number>();

/**
 * @deprecated Will be removed in 2.0.0
 */
export const timeout = {
  /**
   * Runs a set of code at a future time specified by tickDelay
   * @param id Timeout id
   * @param callback Code to run after the specified amount of time
   * @param tickDelay Amount of time, in ticks, before the callback will be called
   */
  run(id: string, callback: (id: string) => void, tickDelay: number) {
    if (runIds.has(id)) {
      throw new Error(`Timeout '${id}' already exists.`);
    }
    const runId = system.runTimeout(() => {
      runIds.delete(id);
      callback(id);
    }, tickDelay);
    runIds.set(id, runId);
  },
  /**
   * Cancel the execution of a timeout with the specified id
   * @param id Timeout id
   */
  clear(id: string) {
    const runId = runIds.get(id);
    if (runId) {
      runIds.delete(id);
      system.clearRun(runId);
    }
  },
  /**
   * Check if a timeout with the specified id exists
   * @param id Timeout id
   */
  has(id: string) {
    return runIds.has(id);
  },
} as const;
