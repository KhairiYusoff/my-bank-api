const ROLES = {
  // Bank Staff Roles
  SUPER_ADMIN: "super_admin", // Bank's system administrator
  BRANCH_MANAGER: "branch_manager", // Branch manager approval rights
  TELLER: "teller", // Counter services
  CUSTOMER_SERVICE: "customer_service", // Customer service representative
  LOAN_OFFICER: "loan_officer", // Loan processing and approval
  RELATIONSHIP_MANAGER: "relationship_manager", // Premier/Preferred banking
  COMPLIANCE_OFFICER: "compliance_officer", // KYC and compliance checking
  AUDITOR: "auditor", // Internal auditor

  // Customer Roles
  RETAIL_CUSTOMER: "retail_customer", // Regular retail banking customer
  PREMIER_CUSTOMER: "premier_customer", // Premier banking customer
  CORPORATE_CUSTOMER: "corporate_customer", // Business/Corporate customer
  MERCHANT: "merchant", // Business accepting payments

  // Digital Banking Roles
  DIGITAL_USER: "digital_user", // Activated online banking
  MOBILE_USER: "mobile_user", // Mobile app user
};

// Roles that receive real-time staff notifications (admin portal websocket channel)
const STAFF_ROLES = ["admin", "banker"];

module.exports = {
  ROLES,
  STAFF_ROLES,
};