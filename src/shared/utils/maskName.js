function maskName(fullName) {
  if (!fullName || typeof fullName !== "string") return "****";

  const words = fullName.trim().split(/\s+/);

  if (words.length === 1) {
    return `${words[0][0]}****`;
  }

  return `${words[0]} ${words[1][0]}****`;
}

module.exports = { maskName };
