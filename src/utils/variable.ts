import { Entity } from "@minecraft/server";
import { MolangRunner } from "./molang_runner.js";

let molangRunner: MolangRunner;

/**
 * Set a variable to be used in client-side entities
 * @deprecated Will be removed in 2.0.0; use {@link MolangRunner} instead
 *
 * @param entity - The entity to set the variable on
 * @param key - The key of the variable
 * @param value - The value of the variable
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
export function setVariable(entity: Entity, key: string, value: string | number) {
  if (typeof value === "string") {
    value = `'${value}'`;
  }
  molangRunner ??= new MolangRunner("animation.humanoid.base_pose");
  molangRunner.exec(entity, [`v.${key} = ${value}`]);
}
