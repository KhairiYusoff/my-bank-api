const Counter = require("../models/Counter");
const { getBranchCode, PRODUCT_CODES } = require("../constants/reference");

/**
 * Calculates a Luhn checksum digit for a string of digits.
 * @param {string} digits - The digits to calculate checksum for.
 * @returns {number} The checksum digit.
 */
function calculateLuhnChecksum(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = parseInt(digits[digits.length - 1 - i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Obfuscates a sequence number to make it look non-sequential.
 * Uses a simple linear congruential generator (LCG) logic for 6-digit obfuscation.
 * @param {number} seq - The sequential number.
 * @returns {string} 6-digit obfuscated sequence.
 */
function obfuscateSequence(seq) {
  // Use a large prime and a shift to jump around the 1,000,000 space
  // This is a common technique to prevent easy guessing while maintaining uniqueness
  const multiplier = 123457; // Large prime
  const shift = 987654;
  const modulus = 1000000;
  const obfuscated = (seq * multiplier + shift) % modulus;
  return String(obfuscated).padStart(6, "0");
}

/**
 * Generates a unique, real-world style 13-digit bank account number for MyBank.
 * Format: {ProductCode(3)}{BranchCode(3)}{ObfuscatedSequence(6)}{Checksum(1)}
 * 
 * @param {string} accountType - The type of account (savings, current, business, fixed_deposit)
 * @param {string} [branchName] - The branch name or code.
 * @returns {Promise<string>} The generated 13-digit account number.
 */
async function generateAccountNumber(accountType, branchName) {
  const branchCode = getBranchCode(branchName);
  const productCode = PRODUCT_CODES[accountType] || PRODUCT_CODES.savings;
  const counterId = `account_${accountType}_${branchCode}`;

  // Get sequential number (guaranteed unique per product type and branch)
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );

  const sequencePart = obfuscateSequence(counter.seq);
  
  // Combine first 12 digits: PPP + BBB + SSSSSS
  const first12 = productCode + branchCode + sequencePart;
  
  // Calculate checksum for the 13th digit
  const checksum = calculateLuhnChecksum(first12);

  // Final 13-digit account number
  return first12 + checksum;
}

module.exports = {
  generateAccountNumber,
  PRODUCT_CODES,
};
