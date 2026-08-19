const { ACCOUNT_TYPE_NAMES } = require("./accounts");

const APPLICATION_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
};

const USER_ROLES = {
  CUSTOMER: "customer",
  BANKER: "banker",
  AUDITOR: "auditor",
  ADMIN: "admin",
};

const STAFF_ROLES = [USER_ROLES.ADMIN, USER_ROLES.BANKER];
const STAFF_ASSIGNABLE_ROLES = [
  USER_ROLES.BANKER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUDITOR,
];

const USER_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
};

const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_NAMES).reduce(
  (acc, k) => ({ ...acc, [k.toUpperCase()]: k }),
  {},
);

const EMPLOYMENT_TYPES = {
  SALARIED: "salaried",
  SELF_EMPLOYED: "self-employed",
  UNEMPLOYED: "unemployed",
  RETIRED: "retired",
  STUDENT: "student",
};

const SALARY_BRACKETS = {
  LT_1000: "<1000",
  B_1000_2999: "1000-2999",
  B_3000_4999: "3000-4999",
  B_5000_6999: "5000-6999",
  B_7000_9999: "7000-9999",
  GTE_10000: "10000+",
};

const PURPOSE_OF_ACCOUNT = {
  SAVINGS: "savings",
  SALARY_CREDIT: "salary credit",
  INVESTMENT: "investment",
  BUSINESS: "business",
  EDUCATION: "education",
  TRAVEL: "travel",
  OTHERS: "others",
};

const RELATIONSHIPS = {
  PARENT: "parent",
  SPOUSE: "spouse",
  CHILD: "child",
  SIBLING: "sibling",
  RELATIVE: "relative",
  FRIEND: "friend",
  OTHER: "other",
};

const MARITAL_STATUSES = {
  SINGLE: "single",
  MARRIED: "married",
  DIVORCED: "divorced",
  WIDOWED: "widowed",
};

const EDUCATION_LEVELS = {
  NONE: "none",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DIPLOMA: "diploma",
  DEGREE: "degree",
  POSTGRADUATE: "postgraduate",
};

const RESIDENCY_STATUSES = {
  CITIZEN: "citizen",
  PERMANENT_RESIDENT: "permanent resident",
  FOREIGNER: "foreigner",
};

const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUSES);
const USER_ROLE_VALUES = Object.values(USER_ROLES);
const USER_STATUS_VALUES = Object.values(USER_STATUSES);
const ACCOUNT_TYPE_VALUES = Object.values(ACCOUNT_TYPES);
const EMPLOYMENT_TYPE_VALUES = Object.values(EMPLOYMENT_TYPES);
const SALARY_BRACKET_VALUES = Object.values(SALARY_BRACKETS);
const PURPOSE_OF_ACCOUNT_VALUES = Object.values(PURPOSE_OF_ACCOUNT);
const RELATIONSHIP_VALUES = Object.values(RELATIONSHIPS);
const MARITAL_STATUS_VALUES = Object.values(MARITAL_STATUSES);
const EDUCATION_LEVEL_VALUES = Object.values(EDUCATION_LEVELS);
const RESIDENCY_STATUS_VALUES = Object.values(RESIDENCY_STATUSES);

module.exports = {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_VALUES,
  USER_ROLES,
  USER_ROLE_VALUES,
  STAFF_ROLES,
  STAFF_ASSIGNABLE_ROLES,
  USER_STATUSES,
  USER_STATUS_VALUES,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_VALUES,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_VALUES,
  SALARY_BRACKETS,
  SALARY_BRACKET_VALUES,
  PURPOSE_OF_ACCOUNT,
  PURPOSE_OF_ACCOUNT_VALUES,
  RELATIONSHIPS,
  RELATIONSHIP_VALUES,
  MARITAL_STATUSES,
  MARITAL_STATUS_VALUES,
  EDUCATION_LEVELS,
  EDUCATION_LEVEL_VALUES,
  RESIDENCY_STATUSES,
  RESIDENCY_STATUS_VALUES,
};