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
  TableSortLabel,
  TablePagination,
} from "@mui/material";
import logger from "../utils/logger";
import { getComparator } from "../utils/calculateRewards";

/**
 * TotalRewardsTable component displays a sortable and paginated
 * table of total reward points per customer.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array} props.totalRewards - Array of total rewards by customer.
 * @returns {JSX.Element} - Rendered table component.
 */
const TotalRewardsTable = ({ totalRewards }) => {
  logger.debug("TotalRewardsTable: Rendered");

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /**
   * Handles sorting by column when user clicks a header.
   *
   * @param {React.MouseEvent} event - Click event.
   * @param {string} property - Property to sort by.
   */
  const handleRequestSort = useCallback((event, property) => {
    logger.info(`TotalRewardsTable: Sorting requested for ${property}`);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [order, orderBy]);

  /**
   * Handles page change in pagination.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event - Click event.
   * @param {number} newPage - New page number.
   */
  const handleChangePage = useCallback((event, newPage) => {
    logger.info(`TotalRewardsTable: Page changed to ${newPage}`);
    setPage(newPage);
  }, []);

  /**
   * Handles change of number of rows displayed per page.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event.
   */
  const handleChangeRowsPerPage = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    logger.info(`TotalRewardsTable: Rows per page changed to ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  /**
   * Memoized and sorted reward data based on current sort settings.
   */
  const sortedRewards = useMemo(() => {
    const sorted = [...totalRewards].sort(getComparator(order, orderBy));
    logger.debug("TotalRewardsTable: Sorted rewards:", sorted);
    return sorted;
  }, [totalRewards, order, orderBy]);

  /**
   * Memoized paginated data for display.
   */
  const displayedRewards = useMemo(() => {
    const paginated = sortedRewards.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
    logger.debug("TotalRewardsTable: Displayed rewards:", paginated);
    return paginated;
  }, [sortedRewards, page, rowsPerPage]);

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
            {displayedRewards.map((reward) => (
              <TableRow key={reward.name}>
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
        count={totalRewards.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

TotalRewardsTable.propTypes = {
  totalRewards: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalPoints: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default React.memo(TotalRewardsTable);
