import React, { useEffect, useState } from "react";
import { fetchTransactions } from "./api";
import { calculateRewardPoints } from "./utils/calculateRewards";
import TransactionTable from "./components/TransactionTable";
import UserRewardsTable from "./components/UserRewardsTable";
import TotalRewardsTable from "./components/TotalRewardsTable";
import "./style.css";
import { Container, Row, Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
 * The main application component that fetches transactions, calculates reward points,
 * and displays the data in tables with date filtering.
 *
 * @component
 * @returns {JSX.Element} The App component's rendered output.
 */
const App = () => {
  /**
   * @type {Transaction[]}
   */
  const [transactions, setTransactions] = useState([]);
  /**
   * @type {UserReward[]}
   */
  const [userRewards, setUserRewards] = useState([]);
  /**
   * @type {TotalReward[]}
   */
  const [totalRewards, setTotalRewards] = useState([]);
  /**
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);
  /**
   * @type {string | null}
   */
  const [error, setError] = useState(null);
  /**
   * @type {Date | null}
   */
  const [startDate, setStartDate] = useState(null);
  /**
   * @type {Date | null}
   */
  const [endDate, setEndDate] = useState(null);

  /**
   * Fetches transactions from the API on component mount.
   * Calculates reward points for each transaction and sorts them by date.
   * Calls calculateUserRewards to process the initial transaction data.
   */
  useEffect(() => {
    const getTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTransactions();
        const sortedTransactions = data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return (
            dateA.getFullYear() - dateB.getFullYear() ||
            dateA.getMonth() - dateB.getMonth() ||
            dateA.getDate() - dateB.getDate()
          );
        });

        const transactionsWithPoints = sortedTransactions.map(
          (transaction) => ({
            ...transaction,
            rewardPoints: calculateRewardPoints(transaction.price),
          })
        );
        setTransactions(transactionsWithPoints);
        calculateUserRewards(transactionsWithPoints, startDate, endDate);
      } catch (err) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  /**
   * Recalculates user rewards whenever the startDate, endDate, or transactions change.
   */
  useEffect(() => {
    if (transactions.length > 0) {
      calculateUserRewards(transactions, startDate, endDate);
    }
  }, [startDate, endDate, transactions]);

  /**
   * Calculates the reward points earned by each user per month within the specified date range.
   * Also calculates the total reward points for each user across all months within the date range.
   *
   * @param {Transaction[]} transactions An array of transaction objects.
   * @param {Date | null} start The start date for filtering transactions (optional).
   * @param {Date | null} end The end date for filtering transactions (optional).
   */
  const calculateUserRewards = (transactions, start, end) => {
    const rewards = transactions.reduce((acc, transaction) => {
      const dateParts = transaction.date.split('-');
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

      const isAfterOrEqualStart = !startDateObj ||
        (transactionYear > startYear) ||
        (transactionYear === startYear && transactionMonth > startMonth) ||
        (transactionYear === startYear && transactionMonth === startMonth && transactionDay >= startDay);

      const isBeforeOrEqualEnd = !endDateObj ||
        (transactionYear < endYear) ||
        (transactionYear === endYear && transactionMonth < endMonth) ||
        (transactionYear === endYear && transactionMonth === endMonth && transactionDay <= endDay);

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

    setUserRewards([...rewards]);

    const totalRewardPoints = {};
    rewards.forEach(reward => {
      if (totalRewardPoints[reward.name]) {
        totalRewardPoints[reward.name] += reward.totalPoints;
      } else {
        totalRewardPoints[reward.name] = reward.totalPoints;
      }
    });

    const totalRewardsArray = Object.entries(totalRewardPoints).map(([name, totalPoints]) => ({
      name,
      totalPoints
    }));

    setTotalRewards(totalRewardsArray);
  };

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error loading transactions: {error}</div>;
  }

  return (
    <Container>
      <h1>Retailer Reward Program</h1>
      <Row className="mb-3">
        <Col md="auto">
          <Form.Label>Start Date</Form.Label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
            }}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
        <Col md="auto">
          <Form.Label>End Date</Form.Label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
            }}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
      </Row>
      <h2>Transactions</h2>
      <TransactionTable transactions={transactions} startDate={startDate} endDate={endDate} />
      <br />
      <h2>User Rewards (by Month)</h2>
      <UserRewardsTable userRewards={userRewards} startDate={startDate} endDate={endDate} />
      <br />
      <h2>Total Rewards</h2>
      <TotalRewardsTable totalRewards={totalRewards} startDate={startDate} endDate={endDate} />
    </Container>
  );
};

export default App;