import {
  Entity,
  EntityComponentTypes,
  EntityProjectileComponent,
  Vector3,
  system,
} from "@minecraft/server";
import { Vec3 } from "../math/vec3.js";

export type ShootProjectileOptions = {
  power?: number;
  gravity?: number;
  inertia?: number;
  liquidInertia?: number;
  location?: Vector3;
  direction?: Vector3;
};

/**
 * @deprecated Will be removed in 2.0.0; enable [isolated_physics](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_projectile?view=minecraft-bedrock-stable#isolated_physics)
 * and use {@link EntityProjectileComponent.shoot} instead.
 */
export function shootProjectile(
  shooter: Entity,
  identifier: string,
  options?: ShootProjectileOptions,
): EntityProjectileComponent {
  const {
    power = 1,
    gravity = 0.05,
    inertia = 0.99,
    liquidInertia = 0.6,
    location = shooter.getHeadLocation(),
    direction = shooter.getViewDirection(),
  } = options ?? {};

  const entity = shooter.dimension.spawnEntity(identifier, Vec3.add(location, direction));
  const projectile = entity.getComponent(EntityComponentTypes.Projectile);
  if (!projectile) {
    throw new Error(`Entity ${entity.typeId} does not have minecraft:projectile component!`);
  }
  projectile.owner = shooter;

  let velocity = Vec3.scale(direction, power);
  const g = new Vec3(0, gravity, 0);
  const runId = system.runInterval(() => {
    if (!entity.isValid) {
      return system.clearRun(runId);
    }
    entity.clearVelocity();
    entity.applyImpulse(velocity);
    velocity = velocity.subtract(g).scale(entity.isInWater ? liquidInertia : inertia);
  });
  return projectile;
}
