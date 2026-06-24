function getMytParts(date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kuala_Lumpur",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const partMap = {};
    for (const part of parts) {
        partMap[part.type] = parseInt(part.value, 10);
    }
    return {
        year: partMap.year,
        month: partMap.month - 1,
        day: partMap.day,
    };
}

function isDormancyAnniversary(statusUpdatedDate, today = new Date()) {
    const startParts = getMytParts(statusUpdatedDate);
    const currentParts = getMytParts(today);

    const yearsDiff = currentParts.year - startParts.year;
    if (yearsDiff <= 0) return false;

    // Must be same month of the year
    if (currentParts.month !== startParts.month) return false;

    // Standard day match
    if (currentParts.day === startParts.day) return true;

    // Handle Feb 29 on non-leap years
    if (startParts.day === 29 && startParts.month === 1) {
        const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeap(currentParts.year) && currentParts.day === 28) {
            return true;
        }
    }

    return false;
}

module.exports = {
    getMytParts,
    isDormancyAnniversary,
};
