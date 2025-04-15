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
  TableSortLabel,
  TablePagination,
  TextField,
} from "@mui/material";
import logger from "../utils/logger"; // Assuming TotalRewardsTable is in src/components

/**
 * Compares two objects for descending order based on the specified property.
 *
 * @param {object} a The first object to compare.
 * @param {object} b The second object to compare.
 * @param {string} orderBy The property to compare by.
 * @returns {number} -1 if b[orderBy] < a[orderBy], 1 if b[orderBy] > a[orderBy], 0 otherwise.
 */
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

/**
 * Returns a comparator function based on the specified order and orderBy property.
 *
 * @param {('asc' | 'desc')} order The order direction ('asc' or 'desc').
 * @param {string} orderBy The property to sort by.
 * @returns {(a: object, b: object) => number} A comparator function.
 */
const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

/**
 * Displays a table of total reward points for each customer, allowing sorting by name and total points, pagination, and searching.
 *
 * @component
 * @param {object} props The component's props.
 * @param {Array<object>} props.totalRewards An array of total reward objects. Each object should have properties like name and totalPoints.
 * @param {Date | null} props.startDate The start date (currently not used by this component but might be intended for future filtering).
 * @param {Date | null} props.endDate The end date (currently not used by this component but might be intended for future filtering).
 * @returns {JSX.Element} The TotalRewardsTable component's rendered output.
 * @author Gulrez Eqbal <gulrez.tabrez@gmail.com>
 */
const TotalRewardsTable = ({ totalRewards, startDate, endDate }) => { // Receive startDate and endDate as props
  logger.debug("TotalRewardsTable: Rendered");
  /**
   * @type {('asc' | 'desc')}
   */
  const [order, setOrder] = useState("asc");
  /**
   * @type {string}
   */
  const [orderBy, setOrderBy] = useState("name");
  /**
   * @type {number}
   */
  const [page, setPage] = useState(0);
  /**
   * @type {number}
   */
  const [rowsPerPage, setRowsPerPage] = useState(5);
  /**
   * @type {string}
   */
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Handles the request to sort the table by a specific property (name or totalPoints).
   * Toggles the sorting order (ascending/descending) for the selected property.
   *
   * @param {React.SyntheticEvent} event The event object.
   * @param {string} property The property to sort by ('name' or 'totalPoints').
   */
  const handleRequestSort = (event, property) => {
    logger.info(`TotalRewardsTable: Sorting requested for ${property}`);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  /**
   * Handles the change of the current page in the pagination.
   *
   * @param {React.SyntheticEvent} event The event object.
   * @param {number} newPage The new page number.
   */
  const handleChangePage = (event, newPage) => {
    logger.info(`TotalRewardsTable: Page changed to ${newPage}`);
    setPage(newPage);
  };

  /**
   * Handles the change of the number of rows per page in the pagination.
   *
   * @param {React.SyntheticEvent} event The event object.
   */
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    logger.info(`TotalRewardsTable: Rows per page changed to ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  /**
   * Filters the total rewards based on the search query entered by the user in the search bar.
   * It checks if the customer's name or the total reward points include the search query (case-insensitive).
   *
   * @type {Array<object>}
   */
  const filteredRewards = totalRewards.filter(
    (reward) =>
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.totalPoints.toString().includes(searchQuery)
  );
  logger.debug("TotalRewardsTable: Filtered rewards:", filteredRewards);

  /**
   * Sorts the filtered total rewards using the specified comparator and order.
   *
   * @type {Array<object>}
   */
  const sortedRewards = filteredRewards.sort(getComparator(order, orderBy));
  logger.debug("TotalRewardsTable: Sorted rewards:", sortedRewards);

  /**
   * Gets the subset of sorted total rewards to display on the current page.
   *
   * @type {Array<object>}
   */
  const displayedRewards = sortedRewards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  logger.debug("TotalRewardsTable: Displayed rewards:", displayedRewards);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "name")}
                >
                  Customer Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalPoints"}
                  direction={orderBy === "totalPoints" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "totalPoints")}
                >
                  Total Reward Points
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRewards.map((reward, index) => (
              <TableRow key={index}>
                <TableCell>{reward.name}</TableCell>
                <TableCell align="right">{reward.totalPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRewards.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

/**
 * @typedef {object} TotalReward
 * @property {string} name - The name of the customer.
 * @property {number} totalPoints - The total reward points for the customer across all months.
 */

TotalRewardsTable.propTypes = {
  /**
   * An array of total reward objects to display in the table.
   * @type {Array<TotalReward>}
   * @required
   */
  totalRewards: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalPoints: PropTypes.number.isRequired,
    })
  ).isRequired,
  /**
   * The start date (currently not used by this component).
   * @type {Date | null}
   */
  startDate: PropTypes.object,
  /**
   * The end date (currently not used by this component).
   * @type {Date | null}
   */
  endDate: PropTypes.object,
};

export default TotalRewardsTable;