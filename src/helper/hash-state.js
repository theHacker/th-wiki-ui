import {watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {watchImmediate} from "@vueuse/core";

function enumSymbolToString(symbol, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }

    return Object.keys(enumObject)
        .find(key => enumObject[key] === symbol) || null;
}

function stringToEnumSymbolToString(string, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }

    return enumObject[string] || null;
}

/**
 * Callback function to check if a value is valid.
 * Invalid values are not accepted during deserialization and replace by the default value.
 *
 * @callback ValidFunction
 * @param value
 * @returns {Boolean} true if value is valid, false else.
 */

/**
 * Configuration object for a state to sync to the URL's hash.
 *
 * @typedef {Object} StateConfig
 * @property {'enum'|'number'} type
 * @property {Ref<Symbol | Number>} ref Vue ref to state
 * @property {Object | null} enumObject (for 'enum' type) which enum object to use to serialize/deserialize
 * @property {Number | null} defaultValue (for 'number' type) invalid values are deserialize to this default value
 * @property {ValidFunction} isValid (for 'number' type) checks if a (deserialized!) value is valid.
 *                                   'enum' use the first valid enum value as default.
 */

/**
 * Synchronize a number of reactive variables to the URL's hash.
 * Supported are enums and numbers.
 *
 * @param {Array<StateConfig>} stateConfigs
 */
function syncStateToHash(stateConfigs) {
    const route = useRoute();
    const router = useRouter();

    const refs = stateConfigs.map(s => s.ref);

    // State changed => adapt hash
    watch(refs, () => {
        const encodedStates = stateConfigs
            .map(stateConfig => {
                switch (stateConfig.type) {
                    case 'enum':
                        return enumSymbolToString(stateConfig.ref.value, stateConfig.enumObject)
                    case 'number':
                        return stateConfig.ref.value.toString();
                    default:
                        throw new Error(`Unsupported type "${stateConfig.type}"`);
                }
            })
            .join(':');

        router.replace({
            hash: '#' + encodedStates
        });
    });

    // Hash changed => adapt state
    watchImmediate(() => route.hash, () => {
        const decodedStates = (route.hash || '#')
            .replace(/^#/, '')
            .split(':');

        for (let i = 0; i < stateConfigs.length; i++){
            const stateConfig = stateConfigs[i];
            const decodedState = decodedStates[i];

            switch (stateConfig.type) {
                case 'enum':
                    stateConfig.ref.value = decodedState ?
                        stringToEnumSymbolToString(decodedState, stateConfig.enumObject) :
                        Object.values(stateConfig.enumObject)[0];
                    break;
                case 'number': {
                    const value = parseInt(decodedState);

                    stateConfig.ref.value = (!isNaN(value) && stateConfig.isValid(value)) ? value : stateConfig.defaultValue;
                    break;
                }
                default:
                    throw new Error(`Unsupported type "${stateConfig.type}"`);
            }
        }
    });
}

export { enumSymbolToString, stringToEnumSymbolToString, syncStateToHash };
