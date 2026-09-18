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
  private static readonly animationIds = new Set<string>();
  private static nextId = 0;

  private readonly prefix = `v.__mr${system.currentTick}_${MolangRunner.nextId++}`;
  private execId = 0;

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
    if (MolangRunner.animationIds.has(animationId)) {
      throw new Error("Cannot create another MolangRunner instance with the same animationId");
    }
    MolangRunner.animationIds.add(animationId);
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
    const execId = this.execId++;
    const group = Math.floor(execId / 1_000_000);
    const index = execId % 1_000_000;
    const marker = `${this.prefix}_${group}`;

    const condition = `(${marker}??-1)<${index}`;

    const expr = opts?.includePaperDoll
      ? expressions.join(";")
      : `!q.is_in_ui?{${expressions.join(";")}}`;

    const update = `${marker}=${index}`;

    entity.playAnimation(this.animationId, {
      controller: this.animationId,
      players: opts?.players ?? getAllPlayers(),
      stopExpression: `${condition}?{${expr};${update}};return 0;`,
    });
  }
}
