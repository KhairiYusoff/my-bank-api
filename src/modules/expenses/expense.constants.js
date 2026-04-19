/**
 * Expense-related constants and helper functions
 * Centralized configuration for expense categories, payment methods, etc.
 */

// Expense categories with subcategories
const EXPENSE_CATEGORIES = {
  FOOD: {
    value: 'food',
    label: 'Food & Dining',
    subcategories: [
      { value: 'groceries', label: 'Groceries' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'hawker', label: 'Hawker/Stall' },
      { value: 'coffee', label: 'Coffee & Tea' },
      { value: 'delivery', label: 'Food Delivery' },
      { value: 'alcohol', label: 'Alcohol' },
      { value: 'other_food', label: 'Other Food' }
    ]
  },
  TRANSPORT: {
    value: 'transport',
    label: 'Transportation',
    subcategories: [
      { value: 'petrol', label: 'Petrol/Gas' },
      { value: 'public_transport', label: 'Public Transport' },
      { value: 'taxi', label: 'Taxi/Grab' },
      { value: 'parking', label: 'Parking' },
      { value: 'toll', label: 'Toll' },
      { value: 'car_insurance', label: 'Car Insurance' },
      { value: 'road_tax', label: 'Road Tax' },
      { value: 'maintenance', label: 'Vehicle Maintenance' },
      { value: 'other_transport', label: 'Other Transport' }
    ]
  },
  SHOPPING: {
    value: 'shopping',
    label: 'Shopping',
    subcategories: [
      { value: 'clothing', label: 'Clothing' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'groceries', label: 'Household Items' },
      { value: 'personal_care', label: 'Personal Care' },
      { value: 'books', label: 'Books & Stationery' },
      { value: 'online_shopping', label: 'Online Shopping' },
      { value: 'other_shopping', label: 'Other Shopping' }
    ]
  },
  UTILITIES: {
    value: 'utilities',
    label: 'Utilities & Bills',
    subcategories: [
      { value: 'electricity', label: 'Electricity' },
      { value: 'water', label: 'Water' },
      { value: 'internet', label: 'Internet' },
      { value: 'phone', label: 'Phone Bill' },
      { value: 'streaming', label: 'Streaming Services' },
      { value: 'other_utilities', label: 'Other Utilities' }
    ]
  },
  HOUSING: {
    value: 'housing',
    label: 'Housing & Loans',
    subcategories: [
      { value: 'rent', label: 'Rent' },
      { value: 'mortgage', label: 'Mortgage' },
      { value: 'car_loan', label: 'Car Loan' },
      { value: 'personal_loan', label: 'Personal Loan' },
      { value: 'student_loan', label: 'Student Loan' },
      { value: 'property_tax', label: 'Property Tax' },
      { value: 'home_insurance', label: 'Home Insurance' },
      { value: 'maintenance', label: 'Home Maintenance' },
      { value: 'other_housing', label: 'Other Housing' }
    ]
  },
  HEALTHCARE: {
    value: 'healthcare',
    label: 'Healthcare',
    subcategories: [
      { value: 'doctor', label: 'Doctor Visit' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'gym', label: 'Gym & Fitness' },
      { value: 'other_healthcare', label: 'Other Healthcare' }
    ]
  },
  ENTERTAINMENT: {
    value: 'entertainment',
    label: 'Entertainment',
    subcategories: [
      { value: 'movies', label: 'Movies & Cinema' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'concerts', label: 'Concerts & Events' },
      { value: 'sports', label: 'Sports' },
      { value: 'other_entertainment', label: 'Other Entertainment' }
    ]
  },
  EDUCATION: {
    value: 'education',
    label: 'Education',
    subcategories: [
      { value: 'tuition', label: 'Tuition' },
      { value: 'courses', label: 'Courses' },
      { value: 'books', label: 'Books & Materials' },
      { value: 'other_education', label: 'Other Education' }
    ]
  },
  PERSONAL: {
    value: 'personal',
    label: 'Personal',
    subcategories: [
      { value: 'gifts', label: 'Gifts' },
      { value: 'charity', label: 'Charity & Donations' },
      { value: 'zakat', label: 'Zakat' },
      { value: 'personal_care', label: 'Personal Care' },
      { value: 'other_personal', label: 'Other Personal' }
    ]
  },
  TRAVEL: {
    value: 'travel',
    label: 'Travel',
    subcategories: [
      { value: 'flights', label: 'Flights' },
      { value: 'hotels', label: 'Hotels' },
      { value: 'transport', label: 'Travel Transport' },
      { value: 'activities', label: 'Activities' },
      { value: 'other_travel', label: 'Other Travel' }
    ]
  },
  OTHER: {
    value: 'other',
    label: 'Other',
    subcategories: [
      { value: 'miscellaneous', label: 'Miscellaneous' },
      { value: 'uncategorized', label: 'Uncategorized' }
    ]
  }
};

// Payment methods compatible with bank accounts
const PAYMENT_METHODS = {
  ONLINE_BANKING: { value: 'online_banking', label: 'Online Banking' },
  DEBIT_CARD: { value: 'debit_card', label: 'Debit Card' },
  QR_PAY: { value: 'qr_pay', label: 'QR Pay' },
  BANK_TRANSFER: { value: 'bank_transfer', label: 'Bank Transfer' },
  CASH: { value: 'cash', label: 'Cash' },
  OTHER: { value: 'other', label: 'Other' }
};

// Helper functions
const getAllCategories = () => {
  return Object.values(EXPENSE_CATEGORIES).map(cat => ({
    value: cat.value,
    label: cat.label,
    subcategories: cat.subcategories
  }));
};

const getCategoryOptions = () => {
  return Object.values(EXPENSE_CATEGORIES).map(cat => ({
    value: cat.value,
    label: cat.label
  }));
};

const getSubcategoriesByCategory = (category) => {
  const cat = Object.values(EXPENSE_CATEGORIES).find(c => c.value === category);
  return cat ? cat.subcategories : [];
};

const getPaymentMethodOptions = () => {
  return Object.values(PAYMENT_METHODS);
};

module.exports = {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  getAllCategories,
  getCategoryOptions,
  getSubcategoriesByCategory,
  getPaymentMethodOptions
};
