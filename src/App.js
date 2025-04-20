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

const calculateDefaultStartDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const startMonth = currentMonth - 2;
  const startYear = currentYear + Math.floor(startMonth / 12);
  const adjustedStartMonth = (startMonth % 12 + 12) % 12;

  return new Date(startYear, adjustedStartMonth, 1);
};

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [totalRewards, setTotalRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [startDate, setStartDate] = useState(calculateDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const getTransactions = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchTransactions();

        const transactionsWithPoints = data.map((transaction) => ({
          ...transaction,
          rewardPoints: calculateRewardPoints(transaction.price),
        }));

        setTransactions(transactionsWithPoints);

        const {
          userRewards: calculatedUserRewards,
          totalRewards: calculatedTotalRewards,
        } = calculateUserRewards(transactionsWithPoints, startDate, endDate);

        setUserRewards(calculatedUserRewards);
        setTotalRewards(calculatedTotalRewards);
      } catch (err) {
        setErrorMessage(err.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, [startDate, endDate]);

  useEffect(() => {
    if (transactions.length > 0) {
      const {
        userRewards: calculatedUserRewards,
        totalRewards: calculatedTotalRewards,
      } = calculateUserRewards(transactions, startDate, endDate);

      setUserRewards(calculatedUserRewards);
      setTotalRewards(calculatedTotalRewards);
    }
  }, [startDate, endDate, transactions]);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (errorMessage) {
    return <div>Error loading transactions: {errorMessage}</div>;
  }

  return (
    <Container>
      <h1>Retailer Reward Program</h1>

      <Row className="mb-3">
        <Col md="auto">
          <Form.Label>Start Date</Form.Label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
        <Col md="auto">
          <Form.Label>End Date</Form.Label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
      </Row>

      <h2>Transactions</h2>
      <TransactionTable
        transactions={transactions}
        startDate={startDate}
        endDate={endDate}
      />

      <br />

      <h2>User Rewards (by Month)</h2>
      <UserRewardsTable
        userRewards={userRewards}
        startDate={startDate}
        endDate={endDate}
      />

      <br />

      <h2>Total Rewards</h2>
      <TotalRewardsTable totalRewards={totalRewards} />
    </Container>
  );
};

export default React.memo(App);
