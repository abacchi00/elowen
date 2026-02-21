export const getRandomFloatFrom = (min: number) => ({
  to: (max: number): number => Math.random() * (max - min) + min,
});

export const getRandomIntegerFrom = (min: number) => ({
  to: (max: number): number => Math.floor(getRandomFloatFrom(min).to(max + 1)),
});
