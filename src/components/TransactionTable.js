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
import { getComparator } from "../utils/calculateRewards";

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

  /**
   * Filters transactions based on the provided start and end dates.
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (!txn.date) return false;
      const [year, month, day] = txn.date.split("-").map(Number);
      const transactionDate = new Date(year, month - 1, day);

      const isAfterOrEqualStart = !startDate || transactionDate >= startDate;
      const isBeforeOrEqualEnd = !endDate || transactionDate <= endDate;

      return isAfterOrEqualStart && isBeforeOrEqualEnd;
    });
  }, [transactions, startDate, endDate]);

  /**
   * Sorts the filtered transactions.
   */
  const sortedTransactions = useMemo(() => {
    return filteredTransactions.sort(getComparator(order, orderBy));
  }, [filteredTransactions, order, orderBy]);

  /**
   * Gets the current page’s slice of transactions.
   */
  const currentTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(sortedTransactions.length / itemsPerPage),
    [sortedTransactions.length]
  );

  return (
    <Paper elevation={3} sx={{ borderRadius: "10px", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  align={cell.numeric ? "right" : "left"}
                  padding={cell.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === cell.id ? order : false}
                  sx={
                    cell.id === "customerId"
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
                    active={orderBy === cell.id}
                    direction={orderBy === cell.id ? order : "asc"}
                    onClick={() => handleRequestSort(cell.id)}
                  >
                    {cell.label}
                    {orderBy === cell.id && (
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
            {currentTransactions.map((txn) => (
              <TableRow key={txn.id}>
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
                  {txn.customerId}
                </TableCell>
                <TableCell>{txn.name}</TableCell>
                <TableCell>
                  {new Date(txn.date).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(txn.price)}
                </TableCell>
                <TableCell align="right">{txn.rewardPoints}</TableCell>
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
