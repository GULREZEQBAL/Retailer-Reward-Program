import logger from "./logger";

/**
 * @typedef {object} Transaction
 * @property {number} customerId - The ID of the customer.
 * @property {string} name - The name of the customer.
 * @property {string} date - The date of the transaction in 'YYYY-MM-DD' format.
 * @property {number} price - The price of the transaction.
 * @property {number} rewardPoints - The reward points earned for the transaction.
 */

/**
 * @typedef {object} UserReward
 * @property {number} customerId - The ID of the customer.
 * @property {string} name - The name of the customer.
 * @property {number} month - The month of the rewards (1-12).
 * @property {number} year - The year of the rewards.
 * @property {number} totalPoints - The total reward points for the customer in that month and year.
 */

/**
 * @typedef {object} TotalReward
 * @property {string} name - The name of the customer.
 * @property {number} totalPoints - The total reward points for the customer across all months.
 */

/**
 * Calculates the reward points earned for a given transaction price.
 * Points are calculated as follows:
 * - $0 - $50: 0 points
 * - $51 - $100: 1 point for every dollar spent over $50
 * - Over $100: 2 points for every dollar spent over $100, plus 50 points for the first $100.
 *
 * @param {number} price The transaction price.
 * @returns {number} The total reward points earned for the price.
 */
export const calculateRewardPoints = (price) => {
  logger.debug("calculateRewardPoints: Calculating reward points for price:", price);

  if (isNaN(price)) {
    logger.error("calculateRewardPoints: Invalid input - price is not a number:", price);
    return 0;
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

/**
 * Calculates the reward points earned by each user per month within the specified date range.
 * Also calculates the total reward points for each user across all months within the date range.
 *
 * @param {Transaction[]} transactions An array of transaction objects.
 * @param {Date | null} start The start date for filtering transactions (optional).
 * @param {Date | null} end The end date for filtering transactions (optional).
 * @returns {{userRewards: UserReward[], totalRewards: TotalReward[]}} An object containing arrays of user rewards and total rewards.
 */
export const calculateUserRewards = (transactions, start, end) => {
  const rewards = transactions.reduce((acc, transaction) => {
    const dateParts = transaction.date.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const transactionDate = new Date(year, month, day);

    let startDateObj = start ? new Date(start) : null;
    let endDateObj = end ? new Date(end) : null;

    let transactionYear = transactionDate.getFullYear();
    let transactionMonth = transactionDate.getMonth();
    let transactionDay = transactionDate.getDate();

    let startYear = startDateObj ? startDateObj.getFullYear() : null;
    let startMonth = startDateObj ? startDateObj.getMonth() : null;
    let startDay = startDateObj ? startDateObj.getDate() : null;

    let endYear = endDateObj ? endDateObj.getFullYear() : null;
    let endMonth = endDateObj ? endDateObj.getMonth() : null;
    let endDay = endDateObj ? endDateObj.getDate() : null;

    const isAfterOrEqualStart =
      !startDateObj ||
      transactionYear > startYear ||
      (transactionYear === startYear && transactionMonth > startMonth) ||
      (transactionYear === startYear &&
        transactionMonth === startMonth &&
        transactionDay >= startDay);

    const isBeforeOrEqualEnd =
      !endDateObj ||
      transactionYear < endYear ||
      (transactionYear === endYear && transactionMonth < endMonth) ||
      (transactionYear === endYear &&
        transactionMonth === endMonth &&
        transactionDay <= endDay);

    if (isAfterOrEqualStart && isBeforeOrEqualEnd) {
      const existingUserIndex = acc.findIndex(
        (user) =>
          user.customerId === transaction.customerId &&
          user.month === month + 1 &&
          user.year === year
      );

      if (existingUserIndex > -1) {
        acc[existingUserIndex].totalPoints += transaction.rewardPoints;
      } else {
        acc.push({
          customerId: transaction.customerId,
          name: transaction.name,
          month: month + 1,
          year,
          totalPoints: transaction.rewardPoints,
        });
      }
    }

    return acc;
  }, []);

  const totalRewardPoints = {};
  rewards.forEach((reward) => {
    if (totalRewardPoints[reward.name]) {
      totalRewardPoints[reward.name] += reward.totalPoints;
    } else {
      totalRewardPoints[reward.name] = reward.totalPoints;
    }
  });

  const totalRewardsArray = Object.entries(totalRewardPoints).map(
    ([name, totalPoints]) => ({
      name,
      totalPoints,
    })
  );

  
  return { userRewards: rewards, totalRewards: totalRewardsArray };
};

/**
 * Compares two objects in descending order by a given property.
 *
 * @param {Object} a - First object.
 * @param {Object} b - Second object.
 * @param {string} orderBy - The property to sort by.
 * @returns {number} - Comparison result.
 */
export const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

/**
 * Returns a comparator function based on the desired sort order and property.
 *
 * @param {"asc"|"desc"} order - Sort order.
 * @param {string} orderBy - Property to sort by.
 * @returns {(a: Object, b: Object) => number} - Comparator function.
 */
export const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};