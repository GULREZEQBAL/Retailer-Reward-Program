import React, { useState, useMemo } from "react";
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
import { getComparator } from "../utils/calculateRewards"; // Importing from utils

/**
 * Checks if a value is a valid number.
 * @param {*} value - Value to check.
 * @returns {boolean}
 */
const isValidNumber = (value) =>
  !isNaN(value) && value !== null && value !== undefined;

/**
 * Renders a table of user reward data with sorting, pagination, and date filtering.
 *
 * @component
 * @param {object} props - Component props.
 * @param {Array} props.userRewards - List of user reward objects.
 * @param {Date|null} props.startDate - Filter rewards from this date.
 * @param {Date|null} props.endDate - Filter rewards up to this date.
 */
const UserRewardsTable = ({ userRewards, startDate, endDate }) => {
  logger.debug("UserRewardsTable: Rendered");

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("year");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /**
   * Handles sorting request on a column.
   */
  const handleRequestSort = (event, property) => {
    logger.info(`UserRewardsTable: Sorting requested for ${property}`);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  /**
   * Handles pagination page change.
   */
  const handleChangePage = (event, newPage) => {
    logger.info(`UserRewardsTable: Page changed to ${newPage}`);
    setPage(newPage);
  };

  /**
   * Handles change in rows per page.
   */
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    logger.info(`UserRewardsTable: Rows per page changed to ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const filteredUserRewards = useMemo(() => {
    return userRewards.filter((_reward) => {
      const rewardDate = new Date(_reward.year, _reward.month - 1, 1);
      rewardDate.setHours(0, 0, 0, 0);

      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(0, 0, 0, 0)) : null;

      const matchesDateRange =
        (!start || rewardDate >= start) && (!end || rewardDate <= end);

      logger.debug("UserRewardsTable: Filtering", {
        reward: _reward,
        rewardDate,
        start,
        end,
      });

      return matchesDateRange;
    });
  }, [userRewards, startDate, endDate]);

  const sortedUserRewards = useMemo(() => {
    return [...filteredUserRewards].sort(getComparator(order, orderBy)); // Using imported getComparator
  }, [filteredUserRewards, order, orderBy]);

  const displayedUserRewards = useMemo(() => {
    return sortedUserRewards.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedUserRewards, page, rowsPerPage]);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* Table header for Year column */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === "year"}
                  direction={orderBy === "year" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "year")}
                >
                  Year
                </TableSortLabel>
              </TableCell>

              {/* Table header for Month column */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === "month"}
                  direction={orderBy === "month" ? order : "asc"}
                  onClick={(e) => handleRequestSort(e, "month")}
                >
                  Month
                </TableSortLabel>
              </TableCell>

              {/* Table header for Customer ID */}
              <TableCell>Customer ID</TableCell>

              {/* Table header for Name */}
              <TableCell>Name</TableCell>

              {/* Table header for Total Points */}
              <TableCell>Total Points</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedUserRewards.map((_reward) => (
              <TableRow
                key={`${_reward.customerId}-${_reward.year}-${_reward.month}`}
              >
                <TableCell>{_reward.year}</TableCell>
                <TableCell>{_reward.month}</TableCell>
                <TableCell>
                  {isValidNumber(_reward.customerId)
                    ? _reward.customerId
                    : "Invalid ID"}
                </TableCell>
                <TableCell>{_reward.name}</TableCell>
                <TableCell>{_reward.totalPoints}</TableCell>
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

UserRewardsTable.propTypes = {
  userRewards: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      totalPoints: PropTypes.number.isRequired,
    })
  ).isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
};

export default React.memo(UserRewardsTable);
