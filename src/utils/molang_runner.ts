import { Entity, Player, system } from "@minecraft/server";
import { getAllPlayers } from "./players.js";

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
    const expr = opts?.includePaperDoll
      ? expressions.join(";")
      : `!q.is_in_ui?{${expressions.join(";")}}`;

    entity.playAnimation(this.animationId, {
      controller: this.animationId,
      players: opts?.players ?? getAllPlayers(),
      stopExpression: `(v.__??-1)<${currentTick}?{${expr};v.__=${currentTick}};return 0;`,
    });
  }
}
