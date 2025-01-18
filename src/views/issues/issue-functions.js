import {h} from "vue";

/**
 * Renders an optional icon picked from a list of options.
 * We use this to generically render an issue's type, priority, and status icons.
 *
 * At most one of the given options must be matched by the valueMatching function.
 * Optionally a progress can be provided to render add ` (xx%)` to the rendered icon's tooltip.
 *
 * If no option matches, the return value is `null`, i.e. nothing is rendered.
 *
 * @template {{title: String, icon: ?String, iconColor: ?String}} T
 * @param {Array<T>} options all available options
 * @param {(T) => Boolean} valueMatching function to evaluate if an option is the one to render
 * @param {?Number} progress optional progress, will be included into the tooltip
 * @returns {VNode|null} VNode representing a rendered icon or `null`. Use with `<component :is="thisFunction()" />`.
 */
function renderIcon(options, valueMatching, progress) {
    const matchingOption = options.find(option => {
        if (!valueMatching(option)) {
            return false;
        }
        if (!option.icon || !option.iconColor) {
            return false;
        }

        return true;
    });

    if (matchingOption) {
        const classes = `fas fa-${matchingOption.icon} text-${matchingOption.iconColor}`;

        let title = matchingOption.title;
        if (progress != null) {
            title = `${title} (${progress}%)`;
        }

        return h('i', { class: classes, title });
    } else {
        return null;
    }
}

/**
 * Determines if an issue is overdue.
 * It is if is has a dueDate which is reached, and the issue is not already done.
 *
 * @param {{dueDate: ?String, done: Boolean}} issue
 * @returns {boolean}
 */
function isOverdue(issue) {
    if (issue.dueDate === null) return false;
    if (issue.done) return false;

    return (Date.parse(issue.dueDate) < Date.now());
}

export {renderIcon, isOverdue};
