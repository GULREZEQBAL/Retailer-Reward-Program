import React, { useEffect, useState } from "react";
import { fetchTransactions } from "./api";
import { calculateRewardPoints, calculateUserRewards } from "./utils/calculateRewards";
import TransactionTable from "./components/TransactionTable";
import UserRewardsTable from "./components/UserRewardsTable";
import TotalRewardsTable from "./components/TotalRewardsTable";
import "./style.css";
import { Container, Row, Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * The main application component that fetches transactions, calculates reward points,
 * and displays the data in tables with date filtering.
 *
 * @component
 * @returns {JSX.Element} The App component's rendered output.
 *
 */
const App = () => {

  const [transactions, setTransactions] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [totalRewards, setTotalRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
        const { userRewards: calculatedUserRewards, totalRewards: calculatedTotalRewards } =
          calculateUserRewards(transactionsWithPoints, startDate, endDate);
        setUserRewards(calculatedUserRewards);
        setTotalRewards(calculatedTotalRewards);
      } catch (err) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const { userRewards: calculatedUserRewards, totalRewards: calculatedTotalRewards } =
        calculateUserRewards(transactions, startDate, endDate);
      setUserRewards(calculatedUserRewards);
      setTotalRewards(calculatedTotalRewards);
    }
  }, [startDate, endDate, transactions]);

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
      <TotalRewardsTable totalRewards={totalRewards} />
    </Container>
  );
};

export default React.memo(App);
