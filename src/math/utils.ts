/**
 * Clamps the value of n to the passed in min and max values
 */
export function clampNumber(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
