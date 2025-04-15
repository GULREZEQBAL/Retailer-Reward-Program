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
} from "@mui/material";
import logger from "../utils/logger"; 

/**
 * Checks if a value is a valid number (not NaN, null, or undefined).
 *
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is a valid number, false otherwise.
 */
const isValidNumber = (value) => {
  return !isNaN(value) && value !== null && value !== undefined;
};

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
 * Displays a table of user rewards, allowing sorting by year and month, pagination, and filtering by date.
 *
 * @component
 * @param {object} props The component's props.
 * @param {Array<object>} props.userRewards An array of user reward objects. Each object should have properties like customerId, name, month, year, and totalPoints.
 * @param {Date | null} props.startDate The start date to filter rewards (optional). Rewards for months starting on or after this date will be included.
 * @param {Date | null} props.endDate The end date to filter rewards (optional). Rewards for months starting on or before this date will be included.
 * @returns {JSX.Element} The UserRewardsTable component's rendered output.
 * @author Gulrez Eqbal <gulrez.tabrez@gmail.com>
 */
const UserRewardsTable = ({ userRewards, startDate, endDate }) => {
  logger.debug("UserRewardsTable: Rendered");
  /**
   * @type {('asc' | 'desc')}
   */
  const [order, setOrder] = useState("asc");
  /**
   * @type {string}
   */
  const [orderBy, setOrderBy] = useState("year");
  /**
   * @type {number}
   */
  const [page, setPage] = useState(0);
  /**
   * @type {number}
   */
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /**
   * Handles the request to sort the table by a specific property (year or month).
   * Toggles the sorting order (ascending/descending) for the selected property.
   *
   * @param {React.SyntheticEvent} event The event object.
   * @param {string} property The property to sort by ('year' or 'month').
   */
  const handleRequestSort = (event, property) => {
    logger.info(`UserRewardsTable: Sorting requested for ${property}`);
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
    logger.info(`UserRewardsTable: Page changed to ${newPage}`);
    setPage(newPage);
  };

  /**
   * Handles the change of the number of rows per page in the pagination.
   *
   * @param {React.SyntheticEvent} event The event object.
   */
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    logger.info(`UserRewardsTable: Rows per page changed to ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  /**
   * Filters the user rewards based on the provided start and end dates.
   *
   * @type {Array<object>}
   */
  const filteredUserRewards = userRewards.filter((userReward) => {
    const rewardDate = new Date(userReward.year, userReward.month - 1, 1);
    rewardDate.setHours(0, 0, 0, 0); // Normalize time to midnight

    const start = startDate ? new Date(startDate) : null;
    if (start) {
      start.setHours(0, 0, 0, 0); // Normalize time to midnight
    }

    const end = endDate ? new Date(endDate) : null;
    if (end) {
      end.setHours(0, 0, 0, 0); // Normalize time to midnight
    }

    logger.debug("UserRewardsTable: Filtering User Reward - Year:", userReward.year, "Month:", userReward.month);
    logger.debug("UserRewardsTable: Reward Date:", rewardDate);
    logger.debug("UserRewardsTable: Start Date:", start);
    logger.debug("UserRewardsTable: End Date:", end);

    const matchesDateRange =
      (!start || rewardDate >= start) &&
      (!end || rewardDate <= end);

    return matchesDateRange;
  });
  logger.debug("UserRewardsTable: Filtered User Rewards:", filteredUserRewards);

  /**
   * Sorts the filtered user rewards using the specified comparator and order.
   *
   * @type {Array<object>}
   */
  const sortedUserRewards = filteredUserRewards.sort(
    getComparator(order, orderBy)
  );
  logger.debug("UserRewardsTable: Sorted User Rewards:", sortedUserRewards);

  /**
   * Gets the subset of sorted user rewards to display on the current page.
   *
   * @type {Array<object>}
   */
  const displayedUserRewards = sortedUserRewards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  logger.debug("UserRewardsTable: Displayed User Rewards:", displayedUserRewards);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "year"}
                  direction={orderBy === "year" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "year")}
                >
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "month"}
                  direction={orderBy === "month" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "month")}
                >
                  Month
                </TableSortLabel>
              </TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Total Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUserRewards.map((reward) => (
              <TableRow key={`${reward.customerId}-${reward.year}-${reward.month}`}>
                <TableCell>{reward.year}</TableCell>
                <TableCell>{reward.month}</TableCell>
                <TableCell>
                  {isValidNumber(reward.customerId)
                    ? reward.customerId
                    : "Invalid ID"}
                </TableCell>
                <TableCell>{reward.name}</TableCell>
                <TableCell>{reward.totalPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUserRewards.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

/**
 * @typedef {object} UserReward
 * @property {number} customerId - The ID of the customer.
 * @property {string} name - The name of the customer.
 * @property {number} month - The month of the rewards (1-12).
 * @property {number} year - The year of the rewards.
 * @property {number} totalPoints - The total reward points for the customer in that month and year.
 */

UserRewardsTable.propTypes = {
  /**
   * An array of user reward objects to display in the table.
   * @type {Array<UserReward>}
   * @required
   */
  userRewards: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      totalPoints: PropTypes.number.isRequired,
    })
  ).isRequired,
  /**
   * The start date to filter the rewards. Rewards for months starting on or after this date will be included.
   * @type {Date | null}
   */
  startDate: PropTypes.object,
  /**
   * The end date to filter the rewards. Rewards for months starting on or before this date will be included.
   * @type {Date | null}
   */
  endDate: PropTypes.object,
};

export default UserRewardsTable;