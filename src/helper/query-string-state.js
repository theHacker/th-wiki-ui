import {watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {watchImmediate} from "@vueuse/core";
import {deserializeEnumValue, serializeEnumValue} from "@/helper/enum.js";

/**
 * Callback function to check if a value is valid.
 * Invalid values are not accepted during deserialization and replace by the default value.
 *
 * @callback ValidFunction
 * @param value
 * @returns {Boolean} true if value is valid, false else.
 */

/**
 * Configuration object for a state to sync to the URL's query string.
 *
 * @typedef {Object} StateConfig
 * @property {string} name Name to use for the query parameter
 * @property {'enum'|'string'|'number'} type
 * @property {Ref<Symbol | Number>} ref Vue ref to state
 * @property {Object | null} enumObject (for 'enum' type) which enum object to use to serialize/deserialize
 * @property {Number | null} defaultValue (for 'number' type) invalid values are deserialize to this default value
 * @property {ValidFunction} isValid (for 'number' type) checks if a (deserialized!) value is valid.
 *                                   'enum' use the first valid enum value as default.
 *                                   'string' use an empty string as default.
 */

/**
 * Synchronize a number of reactive variables to the URL's query string.
 * Supported are enums and numbers.
 *
 * @param {Array<StateConfig>} stateConfigs
 */
function syncStateToQueryString(stateConfigs) {
    const route = useRoute();
    const router = useRouter();

    const refs = stateConfigs.map(s => s.ref);

    // State changed => adapt hash
    watch(refs, () => {
        const query = Object.fromEntries(
            stateConfigs.map(stateConfig => {
                let value;
                switch (stateConfig.type) {
                    case 'enum':
                        value = serializeEnumValue(stateConfig.ref.value, stateConfig.enumObject)
                        break;
                    case 'string':
                        value = stateConfig.ref.value;
                        break;
                    case 'number':
                        value = stateConfig.ref.value.toString();
                        break;
                    default:
                        throw new Error(`Unsupported type "${stateConfig.type}".`);
                }

                return [stateConfig.name, value];
            })
        );

        router.replace({ query });
    });

    // Query changed => adapt state
    watchImmediate(() => route.query, (query) => {
        for (let i = 0; i < stateConfigs.length; i++){
            const stateConfig = stateConfigs[i];
            const decodedState = query[stateConfig.name];

            switch (stateConfig.type) {
                case 'enum':
                    stateConfig.ref.value = decodedState ?
                        deserializeEnumValue(decodedState, stateConfig.enumObject) :
                        Object.values(stateConfig.enumObject)[0];
                    break;
                case 'string':
                    stateConfig.ref.value = decodedState || '';
                    break;
                case 'number': {
                    const value = parseInt(decodedState);

                    stateConfig.ref.value = (!isNaN(value) && stateConfig.isValid(value)) ? value : stateConfig.defaultValue;
                    break;
                }
                default:
                    throw new Error(`Unsupported type "${stateConfig.type}".`);
            }
        }
    });
}

export { syncStateToQueryString };
