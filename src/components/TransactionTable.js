import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import logger from "../utils/logger";
import { getComparator } from "../utils/calculateRewards"; // Correctly imported from utils

/**
 * Table header configuration for the TransactionTable.
 */
const headCells = [
  { id: "customerId", numeric: true, disablePadding: false, label: "Customer ID" },
  { id: "name", numeric: false, disablePadding: false, label: "Name" },
  { id: "date", numeric: false, disablePadding: false, label: "Date" },
  { id: "price", numeric: true, disablePadding: false, label: "Price" },
  { id: "rewardPoints", numeric: true, disablePadding: false, label: "Reward Points" },
];

/**
 * TransactionTable component displays a paginated and sortable table of transactions.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.transactions - List of transaction objects.
 * @param {Date} [props.startDate] - Optional start date to filter transactions.
 * @param {Date} [props.endDate] - Optional end date to filter transactions.
 * @returns {JSX.Element} Rendered TransactionTable component.
 */
const TransactionTable = ({ transactions, startDate, endDate }) => {
  logger.debug("TransactionTable: Rendered");

  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("customerId");
  const itemsPerPage = 5;

  /**
   * Handles sorting of the table based on the selected column.
   *
   * @param {string} property - The property to sort by.
   */
  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [order, orderBy]);

  /**
   * Moves to the next page of the table.
   */
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  /**
   * Moves to the previous page of the table.
   */
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => prev - 1);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((_txn) => {
      if (!_txn.date) return false;
      const [year, month, day] = _txn.date.split("-").map(Number);
      const transactionDate = new Date(year, month - 1, day);

      const isAfterOrEqualStart = !startDate || transactionDate >= startDate;
      const isBeforeOrEqualEnd = !endDate || transactionDate <= endDate;

      return isAfterOrEqualStart && isBeforeOrEqualEnd;
    });
  }, [transactions, startDate, endDate]);

  const sortedTransactions = useMemo(() => {
    return filteredTransactions.sort(getComparator(order, orderBy)); // Using the imported getComparator function
  }, [filteredTransactions, order, orderBy]);

  const currentTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => Math.ceil(sortedTransactions.length / itemsPerPage), [sortedTransactions.length]);

  return (
    <Paper elevation={3} sx={{ borderRadius: "10px", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((_cell) => (
                <TableCell
                  key={_cell.id}
                  align={_cell.numeric ? "right" : "left"}
                  padding={_cell.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === _cell.id ? order : false}
                  sx={
                    _cell.id === "customerId"
                      ? {
                          backgroundColor: "#e3f2fd",
                          fontWeight: "bold",
                          fontSize: "1.05rem",
                          color: "#0d47a1",
                          textAlign: "center",
                        }
                      : {}
                  }
                >
                  <TableSortLabel
                    active={orderBy === _cell.id}
                    direction={orderBy === _cell.id ? order : "asc"}
                    onClick={() => handleRequestSort(_cell.id)}
                  >
                    {_cell.label}
                    {orderBy === _cell.id && (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc" ? "sorted descending" : "sorted ascending"}
                      </Box>
                    )}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.map((_txn) => (
              <TableRow key={_txn.id}>
                <TableCell
                  component="th"
                  scope="row"
                  padding="normal"
                  sx={{
                    backgroundColor: "#e3f2fd",
                    fontWeight: "bold",
                    fontSize: "1.05rem",
                    color: "#0d47a1",
                    textAlign: "center",
                  }}
                >
                  {_txn.customerId}
                </TableCell>
                <TableCell>{_txn.name}</TableCell>
                <TableCell>
                  {new Date(_txn.date).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(_txn.price)}
                </TableCell>
                <TableCell align="right">{_txn.rewardPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button onClick={handlePreviousPage} disabled={currentPage === 1} sx={{ mr: 2 }}>
            Previous
          </Button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages} sx={{ ml: 2 }}>
            Next
          </Button>
        </Box>
      )}
    </Paper>
  );
};

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      rewardPoints: PropTypes.number.isRequired,
    })
  ).isRequired,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
};

export default React.memo(TransactionTable);
