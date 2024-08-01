import { Entity, system, Vector3 } from "@minecraft/server";
import { Vec3 } from "../math/vec3.js";

export type ShootProjectileOptions = {
  power?: number;
  gravity?: number;
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
    location = shooter.getHeadLocation(),
    direction = shooter.getViewDirection(),
  } = options ?? {};
  location.y += 0.1;

  const entity = shooter.dimension.spawnEntity(identifier, new Vec3(location).add(direction));
  const projectile = entity.getComponent("minecraft:projectile");
  projectile.owner = shooter;

  let velocity = new Vec3(direction).scale(power);
  const g = new Vec3(0, gravity, 0);
  const runId = system.runInterval(() => {
    if (!entity.isValid()) {
      return system.clearRun(runId);
    }
    entity.applyImpulse(velocity);
    velocity = velocity.subtract(g);
  });
}
