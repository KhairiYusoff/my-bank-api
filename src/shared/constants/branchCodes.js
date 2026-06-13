/**
 * Mapping of branch names to 3-digit codes with state-based prefixes:
 * - 1xx: Pahang
 * - 3xx: Johor
 * - 5xx: Selangor & KL
 * - 7xx: Penang
 */
const BRANCH_CODES = {
  // Selangor & KL (5xx)
  "Main Branch": "501",
  "Kuala Lumpur": "501",
  "Petaling Jaya": "502",
  "Subang Jaya": "503",
  "Shah Alam": "504",
  // Johor (3xx)
  "Johor Bahru": "301",
  "Johor Jaya": "302",
  // Penang (7xx)
  "Penang": "701",
  "George Town": "702",
  // Pahang (1xx)
  "Kuantan": "101",
  "Temerloh": "102",
  // Default
  "Default": "001",
};

/**
 * Gets a 3-digit branch code from a branch name.
 * @param {string} branchName - The name of the branch.
 * @returns {string} 3-digit branch code.
 */
function getBranchCode(branchName) {
  if (!branchName) return BRANCH_CODES["Default"];
  
  // If it's already a 3-digit number string, return it
  if (/^\d{3}$/.test(branchName)) return branchName;
  
  // Look up in mapping
  if (BRANCH_CODES[branchName]) return BRANCH_CODES[branchName];
  
  // Fallback: derive a code from the string hash if not found
  let hash = 0;
  for (let i = 0; i < branchName.length; i++) {
    hash = (hash << 5) - hash + branchName.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash) % 1000).padStart(3, "0");
}

module.exports = {
  BRANCH_CODES,
  getBranchCode,
};
