// Payment validation utilities
export const paymentValidators = {
  // Card number validation (basic Luhn algorithm)
  cardNumber: (value) => {
    const number = value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(number)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let alternate = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  },

  // Expiry date validation (MM/YY format)
  expiryDate: (value) => {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  },

  // CVV validation
  cvv: (value) => {
    return /^\d{3,4}$/.test(value);
  },

  // Cardholder name validation
  cardholderName: (value) => {
    return /^[a-zA-Z\s]{2,50}$/.test(value.trim());
  }
};

// Card type detection
export const getCardType = (number) => {
  const cleaned = number.replace(/\s/g, '');
  
  const cardTypes = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
  };
  
  for (const [type, pattern] of Object.entries(cardTypes)) {
    if (pattern.test(cleaned)) {
      return type;
    }
  }
  
  return 'unknown';
};

// Payment security utilities
export const paymentSecurity = {
  // Mask card number for display
  maskCardNumber: (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return number;
    return '**** **** **** ' + cleaned.slice(-4);
  },

  // Validate payment amount
  validateAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000;
  },

  // Generate secure payment reference
  generatePaymentReference: () => {
    return 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
};

// Payment error messages
export const paymentErrorMessages = {
  INVALID_CARD_NUMBER: 'Please enter a valid card number',
  INVALID_EXPIRY: 'Please enter a valid expiry date (MM/YY)',
  INVALID_CVV: 'Please enter a valid CVV code',
  INVALID_CARDHOLDER_NAME: 'Please enter the cardholder name',
  CARD_EXPIRED: 'This card has expired',
  INSUFFICIENT_FUNDS: 'Insufficient funds or card declined',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  PROCESSING_ERROR: 'Payment processing failed. Please try again',
  INVALID_AMOUNT: 'Invalid payment amount',
  PAYMENT_TIMEOUT: 'Payment timed out. Please try again'
};

// Mock payment gateway responses for testing
export const mockPaymentResponses = {
  // Test card numbers
  testCards: {
    '4111111111111111': 'success', // Visa success
    '4000000000000002': 'declined', // Visa declined
    '5555555555554444': 'success', // Mastercard success
    '5000000000000009': 'insufficient_funds', // Mastercard insufficient funds
    '378282246310005': 'success', // Amex success
    '4000000000000119': 'processing_error' // Generic error
  },

  // Get mock response for card
  getMockResponse: (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return mockPaymentResponses.testCards[cleaned] || 'success';
  }
};