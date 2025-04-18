/**
 * Fetches transaction data from a public JSON file.
 *
 * @returns {Promise<Array<object>>} A promise that resolves with an array of transaction objects.
 * @throws {Error} If the network response is not ok or parsing fails.
 */
export const fetchTransactions = async () => {
  try {
    const response = await fetch('/transactions.json'); // Fetch from the public folder

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error; // Re-throw the error so the calling component can handle it
  }
};