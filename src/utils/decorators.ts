import { BlockCustomComponent, ItemCustomComponent, system } from "@minecraft/server";

// Note for maintainers:
// Put a blank Braille character "⠀" (U+2800) before `@` in example code blocks
// to prevent JSDoc from interpreting decorators as tags.

type EventCallback<T> = (event: T) => any;

type Signal<T, U> = {
  subscribe(callback: EventCallback<T>, options?: U): void;
};

/**
 * Subscribes a static method to a signal when the decorator runs.
 *
 * @param signal - The event signal to subscribe to.
 *
 * @example
 * ```ts
 * class Example {
 *  ⠀@Subscribe(world.afterEvents.entityHurt)
 *   static onHurt(event: EntityHurtAfterEvent) {
 *     // ...
 *   }
 * }
 * ```
 */
export function Subscribe<T, U>(signal: Signal<T, U>, options?: U) {
  return <V extends EventCallback<T>>(
    target: Function,
    _: string,
    descriptor: TypedPropertyDescriptor<V>,
  ) => {
    const method = descriptor.value;
    if (!method) return;
    if (options !== undefined) {
      signal.subscribe(method.bind(target), options);
    } else {
      signal.subscribe(method.bind(target));
    }
  };
}

type CustomComponent<T> = {
  new (): T;
  readonly componentId: string;
};

/**
 * Registers a block custom component class.
 *
 * @example
 * ```ts
 * ⠀@RegisterBlockComponent
 *  class Example implements BlockCustomComponent {
 *    static readonly componentId = "example:my_component";
 *  }
 * ```
 */
export function RegisterBlockComponent<T extends BlockCustomComponent>(target: CustomComponent<T>) {
  const fn = system.beforeEvents.startup.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent(target.componentId, new target());
    system.beforeEvents.startup.unsubscribe(fn);
  });
}

/**
 * Registers an item custom component class.
 *
 * @example
 * ```ts
 * ⠀@RegisterItemComponent
 *  class Example implements ItemCustomComponent {
 *    static readonly componentId = "example:my_component";
 *  }
 * ```
 */
export function RegisterItemComponent<T extends ItemCustomComponent>(target: CustomComponent<T>) {
  const fn = system.beforeEvents.startup.subscribe((event) => {
    event.itemComponentRegistry.registerCustomComponent(target.componentId, new target());
    system.beforeEvents.startup.unsubscribe(fn);
  });
}
