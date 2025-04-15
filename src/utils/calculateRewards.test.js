import { calculateRewardPoints } from './calculateRewards'; // Adjust the path if your file is in a different location

describe('calculateRewardPoints', () => {
  test('should return the correct reward points for a given price', () => {
    const price = 120;
    const expectedRewardPoints = (120 - 100) * 2 + (100 - 50) * 1; // 40 + 50 = 90
    expect(calculateRewardPoints(price)).toBe(90);
  });
});