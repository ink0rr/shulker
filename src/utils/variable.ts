import { Entity, system } from "@minecraft/server";

export type SetVariableOptions = {
  /**
   * The first dummy animation to play.
   * @default "animation.player.attack.positions"
   */
  animation1?: string;
  /**
   * The second dummy animation to play.
   * @default "animation.humanoid.base_pose"
   */
  animation2?: string;
};

/**
 * Set a variable to be used in client-side entities
 * @param entity - The entity to set the variable on
 * @param key - The key of the variable
 * @param value - The value of the variable
 * @param options - The options for setting the variable
 * @example
 * ```ts
 * setVariable(entity, "health", 20); // Equivalent to v.health = 20;
 * ```
 * In example.entity.json
 * ```json
 * {
 *   "scripts": {
 *    "animate": [
 *      { "example": "v.health == 20" }
 *    ]
 *   }
 * }
 * ```
 */
export async function setVariable(
  entity: Entity,
  key: string,
  value: string | number,
  options?: SetVariableOptions,
) {
  const {
    animation1 = "animation.player.attack.positions",
    animation2 = "animation.humanoid.base_pose",
  } = options ?? {};
  const controller = `${key}.${value}`;
  if (typeof value === "string") {
    value = `'${value}'`;
  }
  entity.playAnimation(animation1, {
    controller,
    stopExpression: `v.${key} = ${value}; return 1;`,
  });
  await system.waitTicks(1);
  entity.playAnimation(animation2, {
    controller,
    stopExpression: "0",
  });
}
