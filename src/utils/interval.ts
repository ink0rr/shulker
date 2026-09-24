import { system } from "@minecraft/server";

const runIds = new Map<string, number>();

/**
 * @deprecated Will be removed in 2.0.0
 */
export const interval = {
  /**
   * Runs a set of code on an interval.
   * @param id Interval id
   * @param callback Code to run when the interval occurs
   * @param tickInterval An interval of every N ticks that the callback will be called upon.
   */
  run(id: string, callback: (id: string) => void, tickInterval?: number) {
    if (runIds.has(id)) {
      throw new Error(`Interval '${id}' already exists.`);
    }
    const runId = system.runInterval(() => {
      callback(id);
    }, tickInterval);
    runIds.set(id, runId);
  },
  /**
   * Cancel the execution of an interval with the specified id
   * @param id Interval id
   */
  clear(id: string) {
    const runId = runIds.get(id);
    if (runId) {
      runIds.delete(id);
      system.clearRun(runId);
    }
  },
  /**
   * Check if an interval with the specified id exists
   * @param id Interval id
   */
  has(id: string) {
    return runIds.has(id);
  },
} as const;
