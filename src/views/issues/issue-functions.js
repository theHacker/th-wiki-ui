/**
 * Determines if an issue is overdue.
 * It is if is has a dueDate which is reached, and the issue is not already done.
 *
 * @param {{dueDate: ?String, issueStatus: {doneStatus: Boolean}}} issue
 * @returns {boolean}
 */
function isOverdue(issue) {
    if (!issue.dueDate) return false;
    if (issue.issueStatus.doneStatus) return false;

    return (Date.parse(issue.dueDate) < Date.now());
}

/**
 * Returns a color (Bootstrap text color class) to colorize
 * "how long until the issue is due?".
 *
 * @param {{dueDate: ?String, issueStatus: {doneStatus: Boolean}}} issue
 * @returns {string|null} a CSS class or null to not colorize at all
 */
function getDueColor(issue) {
    if (issue.dueDate === null) return null;
    if (issue.issueStatus.doneStatus) return null;

    const daysUntilDue = (Date.parse(issue.dueDate) - Date.now()) / (1000 * 24 * 3600);

    if (daysUntilDue < 3) {
        return 'text-danger';
    } else if (daysUntilDue < 7) {
        return 'text-danger-emphasis';
    } else if (daysUntilDue < 30) {
        return 'text-warning-emphasis';
    } else if (daysUntilDue < 90) {
        return 'text-success-emphasis';
    } else {
        return null;
    }
}

export {isOverdue, getDueColor};
