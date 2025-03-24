import axios from 'axios';

const apiUrl = window.env.API_URL || import.meta.env.VITE_API_URL;
const graphqlApiUrl = window.env.GRAPHQL_API_URL || import.meta.env.VITE_GRAPHQL_API_URL;

const instance = axios.create({
    baseURL: apiUrl
});

instance.graphql = function(query, variables) {
    return this.post(graphqlApiUrl, { query, variables }, {
        headers: {
            // see https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#media-types,
            // and https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#accept
            'Content-Type': 'application/json',
            'Accept': 'application/graphql-response+json'
        }
    });
}

export default instance;
