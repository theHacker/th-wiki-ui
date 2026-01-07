import {deserializeEnumValue, serializeEnumValue} from "@/helper/enum.js";
import {onMounted, ref, watch} from "vue";

const UserPreferencesKeys = Object.freeze({
    // <AdminTagsView>
    ADMIN_TAGS__SHOW_COLORS: Symbol('ADMIN_TAGS__SHOW_COLORS'),
    ADMIN_TAGS__SHOW_DESCRIPTION: Symbol('ADMIN_TAGS__SHOW_DESCRIPTION'),
    ADMIN_TAGS__DENSE_TABLE: Symbol('ADMIN_TAGS__DENSE_TABLE'),
    // <AttachmentsTab>
    ATTACHMENTS__VIEW: Symbol('ATTACHMENTS__VIEW'),
    // <IssueView>
    ISSUE__FULL_WIDTH: Symbol('ISSUE__FULL_WIDTH'),
    // <IssueView> Dependency Graph
    ISSUE_DEPENDENCY_GRAPH__DEPTH: Symbol('ISSUE_DEPENDENCY_GRAPH__DEPTH'),
    ISSUE_DEPENDENCY_GRAPH__PRUNE_DONE_ISSUES: Symbol('ISSUE_DEPENDENCY_GRAPH__PRUNE_DONE_ISSUES'),
    ISSUE_DEPENDENCY_GRAPH__LINE_CURVE_STYLE: Symbol('ISSUE_DEPENDENCY_GRAPH__LINE_CURVE_STYLE'),
    // <IssuesView>
    ISSUES__SHOW_FILTERS: Symbol('ISSUES__SHOW_FILTERS'),
    ISSUES__SHOW_KEYS: Symbol('ISSUES__SHOW_KEYS'),
    ISSUES__SHOW_ICONS: Symbol('ISSUES__SHOW_ICONS'),
    ISSUES__SHOW_TAGS: Symbol('ISSUES__SHOW_TAGS'),
    ISSUES__SHORTEN_TAGS: Symbol('ISSUES__SHORTEN_TAGS'),
    ISSUES__DENSE_TABLE: Symbol('ISSUES__DENSE_TABLE'),
    // <WikiPagesTree>
    WIKI_PAGES_TREE__SHOW_TAGS: Symbol('WIKI_PAGES_TREE__SHOW_TAGS'),
    WIKI_PAGES_TREE__SHORTEN_TAGS: Symbol('WIKI_PAGES_TREE__SHORTEN_TAGS'),
});

/**
 * Holds user preferences in the browser's localStorage.
 */
class UserPreferences {

    static PREFIX = "thWiki:"

    /**
     * Stores a string in the local storage of the user's browser.
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {String} value
     */
    static storeString(key, value) {
        const storage = window.localStorage;
        if (!storage) return;

        storage.setItem(this.PREFIX + serializeEnumValue(key, UserPreferencesKeys), value);
    }

    /**
     * Stores a boolean in the local storage of the user's browser.
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {Boolean} value
     */
    static storeBoolean(key, value) {
        this.storeString(key, value.toString());
    }

    /**
     * Stores a number in the local storage of the user's browser.
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {Number} value
     */
    static storeNumber(key, value) {
        this.storeString(key, value.toString());
    }

    /**
     * Stores an enum value in the local storage of the user's browser.
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {Object} enumObject
     * @param {Symbol} value
     */
    static storeEnum(key, enumObject, value) {
        this.storeString(key, serializeEnumValue(value, enumObject));
    }

    /**
     * Retrieves a string from the local storage of the user's browser.
     * Returns the default value when the value is no set (or no local storage is available).
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {?String} defaultValue this value will be returned if not value or an invalid value is stored
     * @returns {String | null}
     */
    static retrieveString(key, defaultValue) {
        const storage = window.localStorage;
        if (!storage) return defaultValue;

        const value = storage.getItem(this.PREFIX + serializeEnumValue(key, UserPreferencesKeys));
        if (value === null) return defaultValue;

        return value;
    }

    /**
     * Retrieves a boolean from the local storage of the user's browser.
     * Returns the default value when the value is no set (or no local storage is available).
     *
     * @param {Symbol} key key from UserPreferencesKeys
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
     * Retrieves a number from the local storage of the user's browser.
     * Returns the default value when the value is no set (or no local storage is available).
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {?Number} defaultValue this value will be returned if not value or an invalid value is stored
     * @returns {Number | null}
     */
    static retrieveNumber(key, defaultValue) {
        const value = this.retrieveString(key, null);
        if (value === null) return defaultValue;

        const number = parseInt(value);
        if (isNaN(number)) return defaultValue;

        return number;
    }

    /**
     * Retrieves an enum value from the local storage of the user's browser.
     *
     * @param {Symbol} key key from UserPreferencesKeys
     * @param {?Symbol} defaultValue this value will be returned if not value or an invalid value is stored
     * @param {Object} enumObject
     * @returns {Symbol | null}
     */
    static retrieveEnum(key, enumObject, defaultValue) {
        const value = this.retrieveString(key, null);
        if (value === null) return defaultValue;

        return deserializeEnumValue(value, enumObject) || defaultValue;
    }
}

/**
 * Configuration object for a state to sync to the UserPreferences
 *
 * @typedef {Object} UserPreferencesStateConfig
 * @property {'enum'|'string'|'boolean'|'number'} type
 * @property {any} defaultValue a default value to set when there no state saved (or an invalid one)
 * @property {Symbol} key UserPreferences key to store/retrieve the state to/from
 * @property {Object | null} enumObject (for 'enum' type) which enum object to use to serialize/deserialize
 * @property {ValidFunction} isValid (for 'number' type) checks if a (deserialized!) value is valid
 */

/**
 * Like Vue's ref() function to create a reactive property, but it's also synchronized
 * to the UserPreferences.
 *
 * @param {UserPreferencesStateConfig} config
 */
function refSyncStateToUserPreferences(config) {
    const vueRef = ref(config.defaultValue);

    onMounted(() => {
        switch (config.type) {
            case 'enum':
                vueRef.value = UserPreferences.retrieveEnum(config.key, config.enumObject, config.defaultValue);
                break;
            case 'string':
                vueRef.value = UserPreferences.retrieveString(config.key, config.defaultValue);
                break;
            case 'boolean':
                vueRef.value = UserPreferences.retrieveBoolean(config.key, config.defaultValue);
                break;
            case 'number': {
                const number = UserPreferences.retrieveNumber(config.key, config.defaultValue);

                vueRef.value = (!config.isValid || config.isValid(number)) ? number : config.defaultValue;
                break;
            }
            default:
                throw new Error(`Unsupported type "${config.type}".`);
        }
    });

    watch(vueRef, () => {
        switch (config.type) {
            case 'enum':
                UserPreferences.storeEnum(config.key, config.enumObject, vueRef.value);
                break;
            case 'string':
                UserPreferences.storeString(config.key, vueRef.value);
                break;
            case 'boolean':
                UserPreferences.storeBoolean(config.key, vueRef.value);
                break;
            case 'number':
                UserPreferences.storeNumber(config.key, vueRef.value);
                break;
            default:
                throw new Error(`Unsupported type "${config.type}".`);
        }
    });

    return vueRef;
}

export {UserPreferencesKeys, UserPreferences, refSyncStateToUserPreferences};
