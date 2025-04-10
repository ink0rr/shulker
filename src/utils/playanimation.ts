import { Entity, PlayAnimationOptions } from "@minecraft/server";
import { AnimationIdentifier } from "bedrock-ts";

export type PlayAnimationState<T extends string = string> = {
  blendOutTime?: number;
  transitions?: Array<{ [key in T]?: string }>;
};

/**
 * Creates an animation controller using playanimation
 * @example
 * const controller = new PlayAnimationController("example", {
 *   "animation.humanoid.base_pose": {
 *     blendOutTime: 0.2,
 *     transitions: [{ "animation.armor_stand.zombie_pose": "1" }],
 *   },
 *   "animation.armor_stand.zombie_pose": {
 *     blendOutTime: 0.2,
 *   },
 * });
 * controller.play(player);
 */
export class PlayAnimationController<T extends string> {
  #id: string;
  #animations: [string, PlayAnimationOptions][];

  constructor(id: string, states: Record<T, PlayAnimationState<T>>) {
    this.#id = id;
    this.#animations = [];

    for (const animationName in states) {
      const state = states[animationName];

      if (!state.transitions) {
        const options: PlayAnimationOptions = {
          controller: id,
          blendOutTime: state.blendOutTime,
        };
        this.#animations.push([animationName, options]);
        continue;
      }

      for (const transition of state.transitions) {
        for (const nextState in transition) {
          const options: PlayAnimationOptions = {
            controller: id,
            nextState,
            blendOutTime: state.blendOutTime,
            stopExpression: transition[nextState],
          };
          this.#animations.push([animationName, options]);
        }
      }
    }

    this.#animations = this.#animations.reverse();
  }

  /**
   * Plays the animation on the entity.
   * @param entity The entity to play the animation on.
   */
  play(entity: Entity) {
    for (const [animationName, options] of this.#animations) {
      entity.playAnimation(animationName, options);
    }
  }

  /**
   * Transitions the entity to a new animation state.
   * @param entity The entity to play the animation on.
   * @param animationName The animation identifier. e.g. animation.creeper.swelling
   * @param options Additional options to control the playback and transitions of the animation.
   */
  transitionTo(
    entity: Entity,
    animationName: AnimationIdentifier,
    options?: Omit<PlayAnimationOptions, "controller">,
  ) {
    entity.playAnimation(animationName, { controller: this.#id, ...options });
  }
}
