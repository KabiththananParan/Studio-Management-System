// Validation utilities for the studio rental application

// Regular expression patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Sri Lankan phone patterns: Mobile (07X), Landline (0XX), International (+94)
  phone: /^(\+94|0)?([1-9][0-9]{8}|7[0-9]{8})$/,
  phoneWithFormat: /^(\+94\s?|0)?([1-9][0-9]\s?[0-9]{3}\s?[0-9]{4}|7[0-9]\s?[0-9]{3}\s?[0-9]{4})$/,
  cardNumber: /^\d{13,19}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
  cvv: /^\d{3,4}$/,
  postalCode: /^[A-Za-z0-9\s\-]{3,10}$/,
  routingNumber: /^\d{9}$/,
  accountNumber: /^\d{8,17}$/,
  name: /^[a-zA-Z\s\-\.\']{2,50}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Error messages
export const ERROR_MESSAGES = {
  required: (field) => `${field} is required`,
  invalid: (field) => `Please enter a valid ${field}`,
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must not exceed ${max} characters`,
  match: (field1, field2) => `${field1} must match ${field2}`,
  future: (field) => `${field} must be in the future`,
  past: (field) => `${field} cannot be in the past`,
  range: (field, min, max) => `${field} must be between ${min} and ${max}`,
  custom: (message) => message
};

// Validation functions
export const validators = {
  // Required field validation
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  },

  // Email validation
  email: (email) => {
    if (!email) return false;
    return VALIDATION_PATTERNS.email.test(email.trim());
  },

  // Phone validation for Sri Lankan numbers
  // Supported formats:
  // - Mobile: 070 XXX XXXX, 071 XXX XXXX, 072 XXX XXXX, etc. (07X series)
  // - Landline: 011 XXX XXXX (Colombo), 021 XXX XXXX, 025 XXX XXXX, etc.
  // - International: +94 7X XXX XXXX (mobile), +94 XX XXX XXXX (landline)
  phone: (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\s+/g, '').replace(/[^\d\+]/g, '');
    
    // Check Sri Lankan phone number patterns
    // Mobile: 07XXXXXXXX or +947XXXXXXXX
    // Landline: 0XXXXXXXXX or +94XXXXXXXXX
    if (cleaned.startsWith('+94')) {
      const numberPart = cleaned.substring(3);
      return /^([1-9][0-9]{8}|7[0-9]{8})$/.test(numberPart);
    } else if (cleaned.startsWith('0')) {
      const numberPart = cleaned.substring(1);
      return /^([1-9][0-9]{8}|7[0-9]{8})$/.test(numberPart);
    }
    
    return VALIDATION_PATTERNS.phone.test(cleaned);
  },

  // Name validation
  name: (name) => {
    if (!name) return false;
    return VALIDATION_PATTERNS.name.test(name.trim()) && name.trim().length >= 2;
  },

  // Card number validation (Luhn algorithm)
  cardNumber: (cardNumber) => {
    if (!cardNumber) return false;
    const cleaned = cardNumber.replace(/\s+/g, '');
    
    if (!VALIDATION_PATTERNS.cardNumber.test(cleaned)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let alternate = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let n = parseInt(cleaned.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  },

  // Expiry date validation
  expiryDate: (expiry) => {
    if (!expiry) return false;
    
    if (!VALIDATION_PATTERNS.expiryDate.test(expiry)) {
      return false;
    }
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);
    
    if (expYear < currentYear) {
      return false;
    }
    
    if (expYear === currentYear && expMonth < currentMonth) {
      return false;
    }
    
    return true;
  },

  // CVV validation
  cvv: (cvv) => {
    if (!cvv) return false;
    return VALIDATION_PATTERNS.cvv.test(cvv);
  },

  // Address validation
  address: (address) => {
    if (!address) return false;
    return address.trim().length >= 10 && address.trim().length <= 200;
  },

  // Amount validation
  amount: (amount) => {
    if (amount === null || amount === undefined) return false;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && num <= 100000;
  },

  // Date validation
  dateInFuture: (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  },

  // Password strength validation
  strongPassword: (password) => {
    if (!password) return false;
    return VALIDATION_PATTERNS.strongPassword.test(password);
  },

  // Routing number validation
  routingNumber: (routing) => {
    if (!routing) return false;
    return VALIDATION_PATTERNS.routingNumber.test(routing);
  },

  // Bank account validation
  bankAccount: (account) => {
    if (!account) return false;
    return VALIDATION_PATTERNS.accountNumber.test(account);
  }
};

// Comprehensive form validation function
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    rules.forEach(rule => {
      if (errors[field]) return; // Skip if already has error
      
      const { validator, message, params = [] } = rule;
      
      if (typeof validator === 'function') {
        if (!validator(value, ...params)) {
          errors[field] = message || ERROR_MESSAGES.invalid(field);
        }
      } else if (validators[validator]) {
        if (!validators[validator](value, ...params)) {
          errors[field] = message || ERROR_MESSAGES.invalid(field);
        }
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time field validation
export const validateField = (name, value, rules) => {
  for (const rule of rules) {
    const { validator, message, params = [] } = rule;
    
    if (typeof validator === 'function') {
      if (!validator(value, ...params)) {
        return message || ERROR_MESSAGES.invalid(name);
      }
    } else if (validators[validator]) {
      if (!validators[validator](value, ...params)) {
        return message || ERROR_MESSAGES.invalid(name);
      }
    }
  }
  
  return null;
};

// Format validation helpers
export const formatters = {
  cardNumber: (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  },

  expiryDate: (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  },

  phone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Format Sri Lankan mobile numbers: 07X XXX XXXX
    if (cleaned.startsWith('07') && cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    // Format Sri Lankan landline: 0XX XXX XXXX
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    // Format international: +94 XX XXX XXXX
    if (cleaned.startsWith('94') && cleaned.length === 11) {
      return '+94 ' + cleaned.substring(2).replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    // For incomplete numbers, return as-is with basic spacing
    if (cleaned.length >= 3) {
      return cleaned.replace(/(\d{3})(\d{0,3})(\d{0,4})/, function(match, p1, p2, p3) {
        let formatted = p1;
        if (p2) formatted += ' ' + p2;
        if (p3) formatted += ' ' + p3;
        return formatted;
      });
    }
    
    return cleaned;
  },

  currency: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }
};

// Sanitization helpers
export const sanitizers = {
  name: (value) => {
    return value.trim().replace(/[^a-zA-Z\s\-\.\']/g, '');
  },

  email: (value) => {
    return value.trim().toLowerCase();
  },

  phone: (value) => {
    return value.replace(/[^\d\+\-\s\(\)]/g, '');
  },

  cardNumber: (value) => {
    return value.replace(/[^\d\s]/g, '');
  },

  amount: (value) => {
    return value.replace(/[^\d\.]/g, '');
  }
};

// Business rule validations
export const businessRules = {
  // Check if booking date is within allowed range (up to 6 months ahead)
  validBookingDate: (date) => {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 6);
    
    return selectedDate >= today && selectedDate <= maxDate;
  },

  // Check if refund is allowed (within policy timeframe)
  canRequestRefund: (bookingDate) => {
    if (!bookingDate) return false;
    
    const booking = new Date(bookingDate);
    const now = new Date();
    const hoursUntilBooking = (booking - now) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= 24; // 24 hours minimum for refund
  },

  // Validate minimum age (18+)
  minimumAge: (birthDate) => {
    if (!birthDate) return false;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 18;
  },

  // Check payment amount limits
  validPaymentAmount: (amount, packageType = 'standard') => {
    const limits = {
      standard: { min: 50, max: 5000 },
      premium: { min: 100, max: 10000 },
      enterprise: { min: 500, max: 50000 }
    };
    
    const limit = limits[packageType] || limits.standard;
    return amount >= limit.min && amount <= limit.max;
  }
};

export default {
  validators,
  validateForm,
  validateField,
  formatters,
  sanitizers,
  businessRules,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES
};