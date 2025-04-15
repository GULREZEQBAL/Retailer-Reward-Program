import React from 'react';
import { render, screen } from '@testing-library/react';
import UserRewardsTable from './UserRewardsTable';

describe('UserRewardsTable', () => {
  const sampleRewards = [
    { year: 2024, month: 1, customerId: 101, name: 'John Doe', totalPoints: 90 },
    { year: 2024, month: 1, customerId: 102, name: 'Jane Smith', totalPoints: 25 },
  ];

  test('renders table headers and reward data', () => {
    render(<UserRewardsTable userRewards={sampleRewards} />);

    // Check for table headers
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Customer ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Total Points')).toBeInTheDocument();

    // Check data for the first row (John Doe)
    expect(screen.getByRole('row', { name: /John Doe/i })).toHaveTextContent('2024');
    expect(screen.getByRole('row', { name: /John Doe/i })).toHaveTextContent('1');
    expect(screen.getByRole('row', { name: /John Doe/i })).toHaveTextContent('101');
    expect(screen.getByRole('row', { name: /John Doe/i })).toHaveTextContent('John Doe');
    expect(screen.getByRole('row', { name: /John Doe/i })).toHaveTextContent('90');

    // Check data for the second row (Jane Smith)
    expect(screen.getByRole('row', { name: /Jane Smith/i })).toHaveTextContent('2024');
    expect(screen.getByRole('row', { name: /Jane Smith/i })).toHaveTextContent('1');
    expect(screen.getByRole('row', { name: /Jane Smith/i })).toHaveTextContent('102');
    expect(screen.getByRole('row', { name: /Jane Smith/i })).toHaveTextContent('Jane Smith');
    expect(screen.getByRole('row', { name: /Jane Smith/i })).toHaveTextContent('25');
  });

  test('renders an empty table if no rewards are provided', () => {
    render(<UserRewardsTable userRewards={[]} />);

    // Check for table headers
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Customer ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Total Points')).toBeInTheDocument();

    // Check if no data rows are present
    expect(screen.queryByText('2024')).toBeNull();
  });
});