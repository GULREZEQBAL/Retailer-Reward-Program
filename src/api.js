import logger from "./utils/logger"; 
export const fetchTransactions = async () => {
  try {
    const response = await fetch('/transactions.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedData;
  } catch (error) {
    logger.error("Error fetching transactions:", error);
    throw error;
  }
};