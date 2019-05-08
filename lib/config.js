/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};

// Staging {default} environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': 'AC2ac5a50fa189ed064d7d24d8cfd44943',
        'authToken': 'cf9f5e31544b85fabc6e26a65e63f522',
        'fromPhone': '+13853360759'
    }
};

// Production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAlsoASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': 'AC2ac5a50fa189ed064d7d24d8cfd44943',
        'authToken': 'cf9f5e31544b85fabc6e26a65e63f522',
        'fromPhone': '+13853360759'
    }
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;