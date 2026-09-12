import { Entity, system } from "@minecraft/server";
import { getAllPlayers } from "./players.js";

/**
 * A class for sending Molang expressions to client-side entities.
 */
export class MolangSender {
  private readonly animationId: string;
  private readonly controllerId: string;
  constructor(options?: MolangSenderOptions) {
    this.animationId = options?.animationId ?? "animation.humanoid.base_pose";
    this.controllerId = options?.controllerId ?? "##";
  }
  /**
   * Send expressions to an entity to be used in client-side entities.
   * @param entity - The entity to send the expressions to
   * @param expressions - The expressions to send
   * @param options - The options for sending the expressions
   * @example
   * ```ts
   * const sender = new MolangSender();
   * sender.sendExpressions(entity, {
   *   expressions: ["v.health = 20;", `v.tick = ${system.currentTick}`],
   *   variables: { health: 20, tick: system.currentTick },
   * });
   * ```
   * @throws Error if neither expressions nor variables are provided
   */
  sendExpressions(entity: Entity, options: MolangSenderExprOptions): void {
    if (!options.expressions && !options.variables) {
      throw new Error(
        "You must provide either expressions or variables to send.",
      );
    }
    let expression = options.expressions?.join(";");
    if (options.variables) {
      for (const [key, value] of Object.entries(options.variables)) {
        if (typeof value === "string") {
          expression += `v.${key}='${value}';`;
        } else {
          expression += `v.${key}=${value};`;
        }
      }
    }
    if (!options.includePaperdoll) {
      expression = `!q.is_in_ui?{${expression}};`;
    }
    expression = `(v.__??-1)<=${system.currentTick}?{${expression}v.__=${system.currentTick}};return0;`;
    entity.playAnimation(this.animationId, {
      controller: this.controllerId,
      players: getAllPlayers(),
      stopExpression: expression,
    });
  }
}

export type MolangSenderOptions = {
  controllerId?: string;
  includePaperdoll?: boolean;
  animationId?: string;
};
export type MolangSenderExprOptions = {
  includePaperdoll?: boolean;
  expressions?: string[];
  variables?: Record<string, string | number | boolean>;
};
