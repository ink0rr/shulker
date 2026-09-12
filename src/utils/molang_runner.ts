import { Entity, Player } from "@minecraft/server";
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
  /**
   * @param animationId An empty client animation id.
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
  constructor(private readonly animationId: string) {}

  /**
   * Execute molang expressions on a client-side entity.
   *
   * @param entity Entity to execute the expressions.
   * @param expressions Molang expressions to execute.
   * @param opts Execution options.
   *
   * @example
   * ```ts
   * molangRunner.exec(entity, [
   *   `v.tick = ${system.currentTick};`,
   * ]);
   * ```
   */
  exec(entity: Entity, expressions: readonly string[], opts?: ExecuteMolangOptions): void {
    const includePaperDoll = opts?.includePaperDoll;
    const players = opts?.players ?? getAllPlayers();
    for (const expr of expressions) {
      const controller = (includePaperDoll ? "ui#" : "#") + expr;
      entity.playAnimation(this.animationId, {
        controller,
        players,
        stopExpression: (includePaperDoll ? expr : `!q.is_in_ui?{${expr};}`) + ";return 1;",
      });
    }
  }
}
