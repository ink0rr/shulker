import { Entity, PlayAnimationOptions } from "@minecraft/server";
import { AnimationIdentifier } from "bedrock-ts";
import { getAllPlayers } from "./players.js";

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
  protected animations: [string, PlayAnimationOptions][];

  constructor(
    protected id: string,
    states: Record<T, PlayAnimationState<NoInfer<T>>>,
  ) {
    this.animations = [];

    for (const animationName in states) {
      const state = states[animationName];

      if (!state.transitions) {
        const options: PlayAnimationOptions = {
          controller: id,
          blendOutTime: state.blendOutTime,
        };
        this.animations.push([animationName, options]);
        continue;
      }

      for (const transition of state.transitions) {
        for (const nextState in transition) {
          const options: PlayAnimationOptions = {
            controller: id,
            nextState,
            blendOutTime: state.blendOutTime,
            stopExpression: transition[nextState as keyof typeof transition],
          };
          this.animations.push([animationName, options]);
        }
      }
    }

    this.animations = this.animations.reverse();
  }

  /**
   * Plays the animation on the entity.
   * @param entity The entity to play the animation on.
   */
  play(entity: Entity) {
    const players = getAllPlayers().map((p) => p.name);
    for (const [animationName, options] of this.animations) {
      options.players = players;
      entity.playAnimation(animationName, options);
      options.players = undefined;
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
    const playOptions: PlayAnimationOptions = {
      controller: this.id,
      players: getAllPlayers().map((p) => p.name),
    };
    if (options) {
      Object.assign(playOptions, options);
    }
    entity.playAnimation(animationName, playOptions);
  }
}
