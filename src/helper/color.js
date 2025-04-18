/**
 * CSS color names
 *
 * See CSS Color Module Level 4
 * https://drafts.csswg.org/css-color/#named-colors
 *
 * @type {string[]}
 */
const cssColorNames = [
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond',
    'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue',
    'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
    'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
    'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
    'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
    'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
    'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
    'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
    'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
    'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
    'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
    'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
    'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
    'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
    'yellowgreen'
];

/**
 * Defined Bootstrap color classes.
 *
 * See https://getbootstrap.com/docs/5.3/utilities/colors/
 *
 * @type {string[]}
 */
const bootstrapClasses = [
    'primary', 'primary-emphasis',
    'secondary', 'secondary-emphasis',
    'success', 'success-emphasis',
    'danger', 'danger-emphasis',
    'warning', 'warning-emphasis',
    'info', 'info-emphasis',
    'light', 'light-emphasis',
    'dark', 'dark-emphasis'
];

const hexColorRGB = /#[0-9a-f]{3}/;
const hexColorRRGGBB = /#[0-9a-f]{6}/;
const rgbColor = /rgb\(\s*\d+,\s*\d+,\s*\d+\s*\)/;

/**
 * Parses a color string, supporting
 * - CSS color names (e.g. `red`, `LawnGreen`)
 * - Hex colors (`#rgb`, `#rrggbb`)
 * - `rgb()` function
 * - Bootstrap classes
 *
 * @param {String} color color string to parse
 * @param {Boolean} background `true` to use the color as background color, `false` as foreground color
 * @returns {{}|{class: string}|{style: {color: string}}|{style: {backgroundColor: string}}} style/class definition
 */
function parseColor(color, background) {
    if (
        hexColorRGB.test(color) ||
        hexColorRRGGBB.test(color) ||
        rgbColor.test(color) ||
        cssColorNames.includes(color.toLowerCase())
    ) {
        if (background) {
            return { style: { backgroundColor: color } };
        } else {
            return { style: { color: color } };
        }
    } else if (bootstrapClasses.includes(color)) {
        if (color.endsWith("-emphasis") && background) {
            return {}; // emphasis classes don't work with "text-bg-"
        }

        return { class: 'text-' + (background ? 'bg-' : '') + color };
    } else {
        return {}; // don't style
    }
}

export {parseColor};
