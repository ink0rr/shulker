import { Entity, Player, system } from "@minecraft/server";
import { getAllPlayers } from "./players.js";

const MOLANG_TICK_RADIX = 1_000_000;

export type ExecuteMolangOptions = {
  /** Whether to let the expressions execute in UI context. */
  includePaperDoll?: boolean;
  /** List of players the expressions will be visible to. */
  players?: Player[];
};

/**
 * Utility class for running Molang expressions on client-side entities.
 */
export class MolangRunner {
  private static registeredIds = new Set<string>();
  private execId = 0;
  private execTick = -1;

  /**
   * @param animationId An empty client animation id
   * @example
   * ```json
   * // RP/animations/molang_runner.animation.json
   * {
   *   "format_version": "1.8.0",
   *   "animation.example.molang_runner": {}
   * }
   * ```
   *
   * ```ts
   * // Usage:
   * export const molangRunner = new MolangRunner("animation.example.molang_runner");
   * ```
   */
  constructor(private readonly animationId: string) {
    if (MolangRunner.registeredIds.has(animationId)) {
      throw new Error("Cannot create another MolangRunner instance with the same animationId");
    }
    MolangRunner.registeredIds.add(animationId);
  }

  /**
   * Execute molang expressions on a client-side entity.
   *
   * The molang expression will be executed exactly once at the current tick.
   *
   * @param entity Entity to execute the expressions
   * @param expressions Molang expressions to execute
   * @param opts Execution options
   *
   * @example
   * ```ts
   * molangRunner.exec(entity, [
   *   `v.tick = ${system.currentTick};`,
   * ]);
   * ```
   */
  exec(entity: Entity, expressions: readonly string[], opts?: ExecuteMolangOptions): void {
    const currentTick = system.currentTick;
    if (this.execTick !== currentTick) {
      this.execTick = currentTick;
      this.execId = 0;
    }

    const tickHigh = Math.floor(currentTick / MOLANG_TICK_RADIX);
    const tickLow = currentTick % MOLANG_TICK_RADIX;
    const execId = this.execId++;

    const condition = `(v.__th??-1)<${tickHigh}` +
      `||((v.__th??-1)==${tickHigh}&&((v.__tl??-1)<${tickLow}` +
      `||((v.__tl??-1)==${tickLow}&&(v.__x??-1)<${execId})))`;

    const expr = opts?.includePaperDoll
      ? expressions.join(";")
      : `!q.is_in_ui?{${expressions.join(";")}}`;

    const update = `v.__th=${tickHigh};v.__tl=${tickLow};v.__x=${execId}`;

    entity.playAnimation(this.animationId, {
      controller: this.animationId,
      players: opts?.players ?? getAllPlayers(),
      stopExpression: `(${condition})?{${expr};${update}};return 0;`,
    });
  }
}
