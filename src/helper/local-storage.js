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
     * Retrieves a string from the local storage of the user's browser.
     * Returns `null` when the value is no set (or no local storage is available).
     *
     * @param {String} key
     * @returns {String | null}
     */
    static retrieveString(key) {
        const storage = window.localStorage;
        if (!storage) return null;

        return storage.getItem(key);
    }

    /**
     * Retrieves a boolean from the local storage of the user's browser.
     * Returns `null` when the value is no set (or no local storage is available).
     *
     * @param {String} key
     * @returns {Boolean | null}
     */
    static retrieveBoolean(key) {
        const value = this.retrieveString(key);

        switch (value) {
            case 'true': return true;
            case 'false': return false;
            default: return null;
        }
    }
}

export default UserPreferences;
