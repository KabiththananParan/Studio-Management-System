import React from 'react';
import PropTypes from 'prop-types';
import { PaymentHistory } from '../components';

const HistoryPage = ({ transactions }) => {
  return <PaymentHistory transactions={transactions} />;
};

// PropTypes validation
HistoryPage.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default HistoryPage;