export type RandomGenerator = () => number

/**
 * Returns a floating-point sample in [min, max).
 */
export const randomBetween = (min: number, max: number, random: RandomGenerator): number =>
  min + random() * (max - min)

/**
 * Returns an integer sample in [min, max] (inclusive).
 */
export const randomIntInRange = (min: number, max: number, random: RandomGenerator): number =>
  Math.floor(random() * (max - min + 1)) + min

/**
 * Returns a shuffled copy of the given array.
 */
export const shuffleArray = <T>(items: T[], random: RandomGenerator): T[] => {
  const copied = [...items]
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]]
  }
  return copied
}
