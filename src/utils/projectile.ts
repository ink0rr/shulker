import { Entity, EntityProjectileComponent, system, Vector3 } from "@minecraft/server";
import { Vec3 } from "../math/vec3.js";

export type ShootProjectileOptions = {
  power?: number;
  gravity?: number;
  inertia?: number;
  location?: Vector3;
  direction?: Vector3;
};

export function shootProjectile(
  shooter: Entity,
  identifier: string,
  options?: ShootProjectileOptions,
) {
  const {
    power = 1,
    gravity = 0.05,
    inertia = 0.99,
    location = shooter.getHeadLocation(),
    direction = shooter.getViewDirection(),
  } = options ?? {};
  location.y += 0.1;

  const entity = shooter.dimension.spawnEntity(identifier, Vec3.add(location, direction));
  const projectile = entity.getComponent("minecraft:projectile") as EntityProjectileComponent;
  projectile.owner = shooter;

  let velocity = Vec3.scale(direction, power);
  const g = new Vec3(0, gravity, 0);
  const runId = system.runInterval(() => {
    if (!entity.isValid()) {
      return system.clearRun(runId);
    }
    entity.clearVelocity();
    entity.applyImpulse(velocity);
    velocity = velocity.subtract(g).scale(inertia);
  });
  return projectile;
}
