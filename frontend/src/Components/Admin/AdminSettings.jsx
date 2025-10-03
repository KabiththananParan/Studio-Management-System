import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSettings = ({ isDarkMode }) => {
  const [activeSettingTab, setActiveSettingTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'StudioPro Management',
    siteDescription: 'Professional photography studio management system',
    contactEmail: 'admin@studiopro.com',
    contactPhone: '+1 (555) 123-4567',
    businessHours: {
      start: '09:00',
      end: '18:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    timezone: 'UTC',
    currency: 'USD',
    taxRate: 10,
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromName: 'StudioPro',
    fromEmail: 'noreply@studiopro.com',
    enableEmailNotifications: true,
    enableBookingConfirmations: true,
    enablePaymentNotifications: true,
    enableRefundNotifications: true,
    enableReminderEmails: true,
    reminderHoursBefore: 24
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    enableTwoFactor: false,
    minPasswordLength: 8,
    requireSpecialChars: true,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    maxFileSize: 10,
    ipWhitelist: []
  });

  // Booking Settings State
  const [bookingSettings, setBookingSettings] = useState({
    bookingWindowDays: 90,
    minAdvanceBookingHours: 24,
    maxAdvanceBookingDays: 365,
    allowSameDayBooking: false,
    autoConfirmBookings: false,
    requireDepositPercentage: 25,
    cancellationDeadlineHours: 48,
    refundProcessingDays: 5,
    overduePaymentGraceDays: 3,
    reminderEmailDays: [7, 3, 1],
    allowBookingModification: true,
    maxRescheduleCount: 2
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    enableStripe: false,
    enablePayPal: false,
    enableCashPayments: true,
    enableBankTransfer: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    processingFeePercentage: 2.9,
    processingFeeFixed: 0.30,
    paymentMethods: {
      creditCard: true,
      debitCard: true,
      bankTransfer: true,
      cash: true,
      paypal: false,
      applePay: false,
      googlePay: false
    }
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    enableLogging: true,
    logLevel: 'info',
    logRetentionDays: 30,
    enableBackups: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    enableAnalytics: true,
    analyticsProvider: 'google',
    enableCaching: true,
    cacheExpirationMinutes: 60,
    enableRateLimiting: true,
    rateLimitRequestsPerMinute: 100,
    databaseMaintenanceTime: '02:00'
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    showWelcomeMessage: true,
    enableDesktopNotifications: true,
    autoSaveInterval: 30,
    defaultPageSize: 20,
    enableHotkeys: true
  });

  // Load settings on component mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { data } = response;
      if (data.general) setGeneralSettings(prev => ({ ...prev, ...data.general }));
      if (data.email) setEmailSettings(prev => ({ ...prev, ...data.email }));
      if (data.security) setSecuritySettings(prev => ({ ...prev, ...data.security }));
      if (data.booking) setBookingSettings(prev => ({ ...prev, ...data.booking }));
      if (data.payment) setPaymentSettings(prev => ({ ...prev, ...data.payment }));
      if (data.system) setSystemSettings(prev => ({ ...prev, ...data.system }));
      if (data.preferences) setPreferences(prev => ({ ...prev, ...data.preferences }));
      
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category, settingsData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/settings/${category}`, settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(`Error saving ${category} settings:`, err);
      setError(err.response?.data?.message || `Failed to save ${category} settings`);
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/settings/test-email', emailSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Email connection test successful!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Email connection test failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async (category) => {
    if (!window.confirm(`Are you sure you want to reset ${category} settings to default values?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/admin/settings/reset/${category}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await loadAllSettings();
      setSuccess(`${category} settings reset to defaults successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to reset ${category} settings`);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Site Name
          </label>
          <input
            type="text"
            value={generalSettings.siteName}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Email
          </label>
          <input
            type="email"
            value={generalSettings.contactEmail}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Phone
          </label>
          <input
            type="tel"
            value={generalSettings.contactPhone}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Currency
          </label>
          <select
            value={generalSettings.currency}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="LKR">LKR - Sri Lankan Rupee</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={generalSettings.taxRate}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Timezone
          </label>
          <select
            value={generalSettings.timezone}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Colombo">Colombo</option>
            <option value="Asia/Dubai">Dubai</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Site Description
        </label>
        <textarea
          rows="3"
          value={generalSettings.siteDescription}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
          className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Business Hours Start
          </label>
          <input
            type="time"
            value={generalSettings.businessHours.start}
            onChange={(e) => setGeneralSettings(prev => ({ 
              ...prev, 
              businessHours: { ...prev.businessHours, start: e.target.value }
            }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Business Hours End
          </label>
          <input
            type="time"
            value={generalSettings.businessHours.end}
            onChange={(e) => setGeneralSettings(prev => ({ 
              ...prev, 
              businessHours: { ...prev.businessHours, end: e.target.value }
            }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Working Days</h4>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={generalSettings.businessHours.workingDays.includes(day)}
                onChange={(e) => {
                  const workingDays = e.target.checked
                    ? [...generalSettings.businessHours.workingDays, day]
                    : generalSettings.businessHours.workingDays.filter(d => d !== day);
                  setGeneralSettings(prev => ({ 
                    ...prev, 
                    businessHours: { ...prev.businessHours, workingDays }
                  }));
                }}
                className="rounded"
              />
              <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {day.slice(0, 3)}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>System Options</h4>
        <div className="space-y-3">
          {[
            { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put the system in maintenance mode' },
            { key: 'allowRegistrations', label: 'Allow New Registrations', description: 'Allow new users to register' },
            { key: 'requireEmailVerification', label: 'Require Email Verification', description: 'Require email verification for new accounts' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setGeneralSettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  generalSettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    generalSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('general')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('general', generalSettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save General Settings'}
        </button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SMTP Host
          </label>
          <input
            type="text"
            value={emailSettings.smtpHost}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
            placeholder="smtp.gmail.com"
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SMTP Port
          </label>
          <input
            type="number"
            value={emailSettings.smtpPort}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SMTP Username
          </label>
          <input
            type="text"
            value={emailSettings.smtpUser}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SMTP Password
          </label>
          <input
            type="password"
            value={emailSettings.smtpPassword}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            From Name
          </label>
          <input
            type="text"
            value={emailSettings.fromName}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            From Email
          </label>
          <input
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Reminder Hours Before
          </label>
          <input
            type="number"
            min="1"
            max="72"
            value={emailSettings.reminderHoursBefore}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, reminderHoursBefore: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Notifications</h4>
        <div className="space-y-3">
          {[
            { key: 'enableEmailNotifications', label: 'Enable Email Notifications', description: 'Master switch for all email notifications' },
            { key: 'enableBookingConfirmations', label: 'Booking Confirmations', description: 'Send confirmation emails for new bookings' },
            { key: 'enablePaymentNotifications', label: 'Payment Notifications', description: 'Send emails for payment confirmations' },
            { key: 'enableRefundNotifications', label: 'Refund Notifications', description: 'Send emails for refund processing' },
            { key: 'enableReminderEmails', label: 'Reminder Emails', description: 'Send booking reminder emails' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setEmailSettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  emailSettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <div className="space-x-2">
          <button
            onClick={() => resetToDefaults('email')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Reset to Defaults
          </button>
          <button
            onClick={testEmailConnection}
            disabled={loading}
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        <button
          onClick={() => saveSettings('email', emailSettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Max Login Attempts
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={securitySettings.lockoutDuration}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="15"
            max="480"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password Change Interval (days)
          </label>
          <input
            type="number"
            min="30"
            max="365"
            value={securitySettings.passwordChangeInterval}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordChangeInterval: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Min Password Length
          </label>
          <input
            type="number"
            min="6"
            max="20"
            value={securitySettings.minPasswordLength}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, minPasswordLength: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Max File Size (MB)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={securitySettings.maxFileSize}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Allowed File Types
        </label>
        <input
          type="text"
          value={securitySettings.allowedFileTypes.join(', ')}
          onChange={(e) => setSecuritySettings(prev => ({ 
            ...prev, 
            allowedFileTypes: e.target.value.split(',').map(type => type.trim().toLowerCase())
          }))}
          placeholder="jpg, jpeg, png, pdf, doc, docx"
          className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Security Options</h4>
        <div className="space-y-3">
          {[
            { key: 'requirePasswordChange', label: 'Require Regular Password Changes', description: 'Force users to change passwords periodically' },
            { key: 'enableTwoFactor', label: 'Enable Two-Factor Authentication', description: 'Add an extra layer of security' },
            { key: 'requireSpecialChars', label: 'Require Special Characters in Passwords', description: 'Enforce stronger password requirements' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  securitySettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('security')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('security', securitySettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { key: 'general', label: 'General', icon: '⚙️' },
          { key: 'email', label: 'Email', icon: '📧' },
          { key: 'security', label: 'Security', icon: '🔒' },
          { key: 'booking', label: 'Booking', icon: '📅' },
          { key: 'payment', label: 'Payment', icon: '💳' },
          { key: 'system', label: 'System', icon: '🖥️' },
          { key: 'preferences', label: 'Preferences', icon: '🎨' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSettingTab(tab.key)}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeSettingTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : isDarkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Booking Window (Days)
          </label>
          <input
            type="number"
            min="30"
            max="365"
            value={bookingSettings.bookingWindowDays}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, bookingWindowDays: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Min Advance Booking (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={bookingSettings.minAdvanceBookingHours}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Required Deposit (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={bookingSettings.requireDepositPercentage}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, requireDepositPercentage: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Cancellation Deadline (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={bookingSettings.cancellationDeadlineHours}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, cancellationDeadlineHours: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Max Reschedule Count
          </label>
          <input
            type="number"
            min="0"
            max="5"
            value={bookingSettings.maxRescheduleCount}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, maxRescheduleCount: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Refund Processing (Days)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={bookingSettings.refundProcessingDays}
            onChange={(e) => setBookingSettings(prev => ({ ...prev, refundProcessingDays: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booking Options</h4>
        <div className="space-y-3">
          {[
            { key: 'allowSameDayBooking', label: 'Allow Same Day Booking', description: 'Allow customers to book for the same day' },
            { key: 'autoConfirmBookings', label: 'Auto-Confirm Bookings', description: 'Automatically confirm new bookings' },
            { key: 'allowBookingModification', label: 'Allow Booking Modification', description: 'Allow customers to modify their bookings' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setBookingSettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  bookingSettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    bookingSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('booking')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('booking', bookingSettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Booking Settings'}
        </button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Processing Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={paymentSettings.processingFeePercentage}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, processingFeePercentage: parseFloat(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fixed Processing Fee
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={paymentSettings.processingFeeFixed}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, processingFeeFixed: parseFloat(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Stripe Public Key
          </label>
          <input
            type="text"
            value={paymentSettings.stripePublicKey}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
            placeholder="pk_..."
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            PayPal Client ID
          </label>
          <input
            type="text"
            value={paymentSettings.paypalClientId}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Gateways</h4>
        <div className="space-y-3">
          {[
            { key: 'enableStripe', label: 'Enable Stripe', description: 'Accept credit/debit cards via Stripe' },
            { key: 'enablePayPal', label: 'Enable PayPal', description: 'Accept PayPal payments' },
            { key: 'enableCashPayments', label: 'Enable Cash Payments', description: 'Allow cash payments on-site' },
            { key: 'enableBankTransfer', label: 'Enable Bank Transfer', description: 'Allow bank transfers' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setPaymentSettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  paymentSettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    paymentSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('payment')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('payment', paymentSettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Log Level
          </label>
          <select
            value={systemSettings.logLevel}
            onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Backup Frequency
          </label>
          <select
            value={systemSettings.backupFrequency}
            onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Log Retention (Days)
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={systemSettings.logRetentionDays}
            onChange={(e) => setSystemSettings(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Cache Expiration (Minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={systemSettings.cacheExpirationMinutes}
            onChange={(e) => setSystemSettings(prev => ({ ...prev, cacheExpirationMinutes: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>System Features</h4>
        <div className="space-y-3">
          {[
            { key: 'enableLogging', label: 'Enable Logging', description: 'Enable system activity logging' },
            { key: 'enableBackups', label: 'Enable Backups', description: 'Enable automated database backups' },
            { key: 'enableAnalytics', label: 'Enable Analytics', description: 'Track user behavior and system usage' },
            { key: 'enableCaching', label: 'Enable Caching', description: 'Cache frequently accessed data for performance' },
            { key: 'enableRateLimiting', label: 'Enable Rate Limiting', description: 'Protect against API abuse' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  systemSettings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('system')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('system', systemSettings)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save System Settings'}
        </button>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Theme
          </label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date Format
          </label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Time Format
          </label>
          <select
            value={preferences.timeFormat}
            onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="12h">12 Hour</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Default Page Size
          </label>
          <select
            value={preferences.defaultPageSize}
            onChange={(e) => setPreferences(prev => ({ ...prev, defaultPageSize: parseInt(e.target.value) }))}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Interface Preferences</h4>
        <div className="space-y-3">
          {[
            { key: 'showWelcomeMessage', label: 'Show Welcome Message', description: 'Display welcome message on dashboard' },
            { key: 'enableDesktopNotifications', label: 'Desktop Notifications', description: 'Enable browser notifications' },
            { key: 'enableHotkeys', label: 'Enable Keyboard Shortcuts', description: 'Use keyboard shortcuts for navigation' }
          ].map(option => (
            <div key={option.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  preferences[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => resetToDefaults('preferences')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => saveSettings('preferences', preferences)}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeSettingTab) {
      case 'general':
        return renderGeneralSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'booking':
        return renderBookingSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'system':
        return renderSystemSettings();
      case 'preferences':
        return renderPreferencesSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-2xl shadow-md border`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Admin Settings</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure system settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          {loading && (
            <div className="flex items-center space-x-2 text-blue-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {renderTabNavigation()}
      {renderTabContent()}
    </div>
  );
};

export default AdminSettings;