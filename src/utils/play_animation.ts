import { Entity, PlayAnimationOptions } from "@minecraft/server";

export type AnimationController<K extends string = string> = {
  name: string;
  states: {
    [key in K]?: State<K>;
  };
};

export type State<T extends string = string> = {
  blendOutTime?: number;
  transitions?: Array<{ [key in T]?: string }>;
};

/**
 * Play an animation on an entity in controller style.
 * @param entity - The entity to play the animation on.
 * @param controllers - The controllers to play the animations from.
 * @example
 * playAnimation(player, {
 *   name: "controller.animation",
 *   states: {
 *     "animation.humanoid.base_pose": {
 *       blendOutTime: 0.2,
 *       transitions: [{ "animation.armor_stand.zombie_pose": "true" }],
 *     },
 *     "animation.armor_stand.zombie_pose": {
 *       blendOutTime: 0.2,
 *     },
 *   },
 * });
 */
export function playAnimation<K extends string>(
  entity: Entity,
  ...controllers: AnimationController<K>[]
): void {
  for (const { name: controller, states } of controllers) {
    for (const [stateName, state] of Object.entries(states) as [K, State<K>][]) {
      if (!state) continue;
      const { blendOutTime, transitions } = state;
      const options: PlayAnimationOptions = {
        controller,
        blendOutTime,
      };
      if (transitions) {
        for (const transition of transitions) {
          const nextState = Object.keys(transition)[0] as K;
          const stopExpression = transition[nextState];
          options.nextState = nextState;
          options.stopExpression = stopExpression;
          entity.playAnimation(stateName, options);
        }
      } else {
        entity.playAnimation(stateName, options);
      }
    }
  }
}

/**
 * Stop an animation on an entity.
 * @param entity - The entity to stop the animation on.
 * @param controller - The controllers to stop the animations from.
 * @example
 * stopAnimation(player, "controller.animation");
 */
export function stopAnimation(entity: Entity, ...controller: string[] | AnimationController[]) {
  for (const name of controller) {
    if (typeof name === "string") {
      entity.playAnimation("animation.humanoid.base_pose", { controller: name });
    } else {
      entity.playAnimation("animation.humanoid.base_pose", { controller: name.name });
    }
  }
}
