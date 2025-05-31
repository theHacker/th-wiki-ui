import {enumSymbolToString, stringToEnumSymbolToString} from "@/helper/enum.js";

/**
 * Holds user preferences in the browser's localStorage.
 */
class UserPreferences {

    /**
     * Stores a string in the local storage of the user's browser.
     *
     * @param {String} key
     * @param {String} value
     */
    static storeString(key, value) {
        const storage = window.localStorage;
        if (!storage) return;

        storage.setItem(key, value);
    }

    /**
     * Stores a boolean in the local storage of the user's browser.
     *
     * @param {String} key
     * @param {Boolean} value
     */
    static storeBoolean(key, value) {
        this.storeString(key, value.toString());
    }

    /**
     * Stores an enum value in the local storage of the user's browser.
     *
     * @param {String} key
     * @param {Object} enumObject
     * @param {Symbol} value
     */
    static storeEnum(key, enumObject, value) {
        this.storeString(key, enumSymbolToString(value, enumObject));
    }

    /**
     * Retrieves a string from the local storage of the user's browser.
     * Returns the default value when the value is no set (or no local storage is available).
     *
     * @param {String} key
     * @param {?String} defaultValue this value will be returned if not value or an invalid value is stored
     * @returns {String | null}
     */
    static retrieveString(key, defaultValue) {
        const storage = window.localStorage;
        if (!storage) return defaultValue;

        const value = storage.getItem(key);
        if (value === null) return defaultValue;

        return value;
    }

    /**
     * Retrieves a boolean from the local storage of the user's browser.
     * Returns the default value when the value is no set (or no local storage is available).
     *
     * @param {String} key
     * @param {?Boolean} defaultValue this value will be returned if not value or an invalid value is stored
     * @returns {Boolean | null}
     */
    static retrieveBoolean(key, defaultValue) {
        const value = this.retrieveString(key, null);
        if (value === null) return defaultValue;

        switch (value) {
            case 'true': return true;
            case 'false': return false;
            default: return defaultValue;
        }
    }

    /**
     * Retrieves an enum value from the local storage of the user's browser.
     *
     * @param {String} key
     * @param {?Symbol} defaultValue this value will be returned if not value or an invalid value is stored
     * @param {Object} enumObject
     * @returns {Symbol | null}
     */
    static retrieveEnum(key, enumObject, defaultValue) {
        const value = this.retrieveString(key, null);
        if (value === null) return defaultValue;

        return stringToEnumSymbolToString(value, enumObject) || defaultValue;
    }
}

export default UserPreferences;
