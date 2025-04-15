import React, { useState } from "react";
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
import { visuallyHidden } from '@mui/utils';
import logger from "../utils/logger"; 

/**
 * Compares two objects for descending order based on the specified property.
 *
 * @param {object} a The first object to compare.
 * @param {object} b The second object to compare.
 * @param {string} orderBy The property to compare by.
 * @returns {number} -1 if b[orderBy] < a[orderBy], 1 if b[orderBy] > a[orderBy], 0 otherwise.
 */
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * Returns a comparator function based on the specified order and orderBy property.
 *
 * @param {('asc' | 'desc')} order The order direction ('asc' or 'desc').
 * @param {string} orderBy The property to sort by.
 * @returns {(a: object, b: object) => number} A comparator function.
 */
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Sorts an array of objects stably based on the provided comparator function.
 * Stable sort preserves the original order of elements when their comparison is equal.
 *
 * @param {Array<object>} array The array to sort.
 * @param {(a: [object, number], b: [object, number]) => number} comparator The comparator function.
 * @returns {Array<object>} The stably sorted array.
 */
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

/**
 * @typedef {object} HeadCell
 * @property {string} id - The identifier for the table column.
 * @property {boolean} numeric - Whether the column contains numeric data.
 * @property {boolean} disablePadding - Whether to disable padding for the header cell.
 * @property {string} label - The display label for the table column.
 */

/**
 * @type {HeadCell[]}
 * @constant
 * @default
 */
const headCells = [
  { id: 'customerId', numeric: true, disablePadding: false, label: 'Customer ID' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
  { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
  { id: 'rewardPoints', numeric: true, disablePadding: false, label: 'Reward Points' },
];

/**
 * Displays a table of transactions with sorting and pagination, and allows filtering by date.
 *
 * @component
 * @param {object} props The component's props.
 * @param {Array<object>} props.transactions An array of transaction objects. Each transaction object should have properties like id, customerId, name, date (in 'YYYY-MM-DD' format), price, and rewardPoints.
 * @param {Date | null} props.startDate The start date to filter transactions (optional).
 * @param {Date | null} props.endDate The end date to filter transactions (optional).
 * @returns {JSX.Element} The TransactionTable component's rendered output.
 * @author Gulrez Eqbal <gulrez.tabrez@gmail.com>
 */
const TransactionTable = ({ transactions, startDate, endDate }) => {
  logger.debug("TransactionTable: Rendered");
  /**
   * @type {number}
   */
  const [currentPage, setCurrentPage] = useState(1);
  /**
   * @constant
   * @type {number}
   * @default 5
   */
  const itemsPerPage = 5; // You can adjust this number
  /**
   * @type {('asc' | 'desc')}
   */
  const [order, setOrder] = useState('asc');
  /**
   * @type {string}
   */
  const [orderBy, setOrderBy] = useState('customerId');

  /**
   * Handles the request to sort the table by a specific property.
   * Toggles the sorting order (ascending/descending) for the selected property.
   *
   * @param {string} property The property to sort by.
   */
  const handleRequestSort = (property) => {
    logger.info(`TransactionTable: Sorting requested for ${property}`);
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Filters the transactions based on the provided start and end dates.
   *
   * @type {Array<object>}
   */
  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction.date) {
      logger.warn("TransactionTable: Transaction has no date:", transaction);
      return false;
    }

    const dateParts = transaction.date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const transactionDate = new Date(year, month, day);

    if (!startDate && !endDate) {
      return true;
    }

    const isAfterOrEqualStart = !startDate || transactionDate >= startDate;
    const isBeforeOrEqualEnd = !endDate || transactionDate <= endDate;

    return isAfterOrEqualStart && isBeforeOrEqualEnd;
  });
  logger.debug("TransactionTable: Filtered transactions:", filteredTransactions);

  /**
   * Sorts the filtered transactions using the stableSort algorithm and the current order and orderBy state.
   *
   * @type {Array<object>}
   */
  const sortedTransactions = stableSort(filteredTransactions, getComparator(order, orderBy));
  logger.debug("TransactionTable: Sorted transactions:", sortedTransactions);

  /**
   * @constant
   * @type {number}
   */
  const totalItems = sortedTransactions.length;
  /**
   * @constant
   * @type {number}
   */
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  /**
   * @constant
   * @type {number}
   */
  const startIndex = (currentPage - 1) * itemsPerPage;
  /**
   * @constant
   * @type {number}
   */
  const endIndex = startIndex + itemsPerPage;
  /**
   * @constant
   * @type {Array<object>}
   */
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);
  logger.debug("TransactionTable: Current transactions on page:", currentTransactions);

  /**
   * Handles the event when the user clicks the "Next" page button.
   * Increments the current page number.
   */
  const handleNextPage = () => {
    logger.info(`TransactionTable: Next page requested. Current page: ${currentPage}, Total pages: ${totalPages}`);
    setCurrentPage(prevPage => prevPage + 1);
  };

  /**
   * Handles the event when the user clicks the "Previous" page button.
   * Decrements the current page number.
   */
  const handlePreviousPage = () => {
    logger.info(`TransactionTable: Previous page requested. Current page: ${currentPage}`);
    setCurrentPage(prevPage => prevPage - 1);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell component="th" scope="row" padding="normal">
                  {transaction.customerId}
                </TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString('en-GB')}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(transaction.price)}
                </TableCell>
                <TableCell align="right">{transaction.rewardPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

/**
 * @typedef {object} Transaction
 * @property {number} id - The unique identifier of the transaction.
 * @property {number} customerId - The ID of the customer.
 * @property {string} name - The name of the customer.
 * @property {string} date - The date of the transaction in 'YYYY-MM-DD' format.
 * @property {number} price - The price of the transaction.
 * @property {number} rewardPoints - The reward points earned for the transaction.
 */

TransactionTable.propTypes = {
  /**
   * An array of transaction objects to display in the table.
   * @type {Array<Transaction>}
   * @required
   */
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
  /**
   * The start date to filter the transactions. Transactions on or after this date will be included.
   * @type {Date | null}
   */
  startDate: PropTypes.object,
  /**
   * The end date to filter the transactions. Transactions on or before this date will be included.
   * @type {Date | null}
   */
  endDate: PropTypes.object,
};

export default TransactionTable;