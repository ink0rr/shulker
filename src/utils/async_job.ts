import { system } from "@minecraft/server";

/**
 * A cancellable job that resolves to `true` on completion or `false` on cancellation.
 *
 * Calling `cancel()` stops the job via {@link system.clearJob}.
 * It has no effect after the promise settles.
 */
export type AsyncJob = Promise<boolean> & { cancel(): void };

/**
 * Queues a generator to run until completion via {@link system.runJob}.
 *
 * @param generator - The generator instance to run.
 * @returns A cancellable promise that resolves to `true` when the generator finishes
 * or `false` when cancelled.
 *
 * @example
 * ```ts
 * async function getBlocks(dimension: Dimension, volume: BlockVolume) {
 *   const blocks: Block[] = [];
 *   const job = runJobAsync(function* () {
 *     for (const location of volume.getBlockLocationIterator()) {
 *       const block = dimension.getBlock(location);
 *       if (block) blocks.push(block);
 *       yield;
 *     }
 *   }());
 *
 *   // Cancel the job after 10 ticks if it's still pending.
 *   system.runTimeout(() => job.cancel(), 10);
 *
 *   try {
 *     const completed = await job;
 *     debug.info(`Job ${completed ? "completed" : "cancelled"}. Got ${blocks.length} blocks`);
 *   } catch (err) {
 *     debug.error("Job failed:", err);
 *   }
 *
 *   return blocks;
 * }
 * ```
 */
export function runJobAsync(generator: Generator<void, void, void>): AsyncJob {
  const { promise, resolve, reject } = Promise.withResolvers<boolean>();

  let isSettled = false;
  const jobId = system.runJob(function* () {
    try {
      yield* generator;
      isSettled = true;
      resolve(true);
    } catch (err) {
      isSettled = true;
      reject(err);
    }
  }());

  return Object.assign(promise, {
    cancel() {
      if (isSettled) return;
      isSettled = true;
      system.clearJob(jobId);
      resolve(false);
    },
  });
}
