/**
 * Handles an error while doing a GraphQL API call.
 * Use this function as `.catch()` in the `Promise` chain.
 *
 * It extracts the generic and field errors an returns them.
 *
 * @param {*} e
 * @returns {{genericErrors: string[], fieldErrors: {}}}
 */
function handleError(e) {
    const genericErrors = [];
    const fieldErrors = {};

    // GraphQL errors come as an array (see handleGraphqlResponse())
    if (Array.isArray(e)) {
        for (const error of e) {
            if (error.extensions && error.extensions.field) {
                fieldErrors[error.extensions.field] = error.message;
            } else {
                genericErrors.push(error.message);
            }
        }
    }
    // General errors from Axios (see https://axios-http.com/docs/handling_errors)
    else if (e.response) {
        genericErrors.push("Error in response (HTTP " + e.response.status + "): " + e.response.data);
    }
    else if (e.request) {
        genericErrors.push("No response received.");
    }
    else if (e.message) {
        genericErrors.push(e.message);
    }
    // No clue
    else {
        genericErrors.push("Unknown error");
    }

    return {
        genericErrors,
        fieldErrors
    }
}

/**
 * Handles a GraphQL response. (This function is used automatically when using `axios.graphql()`).
 *
 * We don't support partial results. If there is an `errors` in the response,
 * we don't look at the `data`, but reject immediately.
 *
 * @param response GraphQL response
 * @returns {Promise<*>} either resolved `Promise` to `data`, or rejected `Promise` to `errors`.
 */
function handleGraphqlResponse(response) {
    if (response.data.errors) {
        return Promise.reject(response.data.errors);
    }

    return Promise.resolve(response.data.data);
}

export { handleError, handleGraphqlResponse };
