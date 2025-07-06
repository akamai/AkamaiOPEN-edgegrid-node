// This example demonstrates how to use a custom axios instance with EdgeGrid.
//
// To run this example:
//
// 1. Make sure you have a valid `.edgerc` file with your credentials.
//
// 2. Open a Terminal or shell instance and run "node examples/custom-axios-instance.js".
//
// This example shows how to inject a custom axios instance with custom configuration
// like timeout settings, interceptors, or other axios-specific features.

const EdgeGrid = require('akamai-edgegrid');
const axios = require('axios');

// Create a custom axios instance with specific configuration
const customAxios = axios.create({
    timeout: 30000, // 30 second timeout
    headers: {
        'User-Agent': 'MyCustomApp/1.0'
    }
});

// Add custom interceptors to the axios instance
customAxios.interceptors.request.use(config => {
    console.log('Custom axios instance making request to:', config.url);
    return config;
});

customAxios.interceptors.response.use(response => {
    console.log('Custom axios instance received response:', response.status);
    return response;
});

// Method 1: Using string parameters with custom axios instance
console.log('=== Method 1: String parameters with custom axios ===');
const eg1 = new EdgeGrid(
    'your-client-token',
    'your-client-secret', 
    'your-access-token',
    'your-host.luna.akamaiapis.net',
    false, // debug
    undefined, // max_body
    customAxios // custom axios instance
);

// Method 2: Using object configuration with custom axios instance
console.log('=== Method 2: Object configuration with custom axios ===');
const eg2 = new EdgeGrid({
    path: '~/.edgerc',
    section: 'default',
    axiosInstance: customAxios
});

// Example API call using the custom axios instance
eg1.auth({
    path: '/identity-management/v3/api-clients/self/credentials',
    method: 'GET',
    headers: {
        'Accept': "application/json"
    }
});

eg1.send(function(error, response, body) {
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Response status:', response.status);
        console.log('Response body:', body);
    }
}); 