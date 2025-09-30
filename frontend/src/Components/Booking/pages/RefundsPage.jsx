import React from 'react';
import PropTypes from 'prop-types';
import { RefundManagement } from '../components';

const RefundsPage = ({ transactions }) => {
  return <RefundManagement transactions={transactions} />;
};

// PropTypes validation
RefundsPage.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RefundsPage;