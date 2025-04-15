import PropTypes from "prop-types";
import logger from "./logger";

/**
 * Calculates the reward points earned for a given transaction price.
 * Points are calculated as follows:
 * - $0 - $50: 0 points
 * - $51 - $100: 1 point for every dollar spent over $50
 * - Over $100: 2 points for every dollar spent over $100, plus 50 points for the first $100.
 *
 * @param {number} price The transaction price.
 * @returns {number} The total reward points earned for the price.
 * @author Gulrez Eqbal <gulrez.tabrez@gmail.com>
 */
export const calculateRewardPoints = (price) => {
  logger.debug("calculateRewardPoints: Calculating reward points for price:", price);

  if (isNaN(price)) {
    logger.error("calculateRewardPoints: Invalid input - price is not a number:", price);
    return 0; // Return 0 points for non-numeric input
  }

  let points = 0;
  const wholePrice = Math.floor(price);

  if (wholePrice > 100) {
    points += (wholePrice - 100) * 2;
    points += 50;
  } else if (wholePrice > 50) {
    points += (wholePrice - 50) * 1;
  }

  logger.info("calculateRewardPoints: Calculated reward points:", points);
  return points;
};

calculateRewardPoints.propTypes = {
  /**
   * The price of the transaction.
   * @type {number}
   * @required
   */
  price: PropTypes.number.isRequired,
};