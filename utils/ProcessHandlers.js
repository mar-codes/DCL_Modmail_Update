const Logs = require('./Logs.js');

module.exports = () => {

    // Crtl + C
    process.on('SIGINT', () => {
        console.log();
        Logs.error('SIGINT: Closing database and exiting...');
        process.reallyExit(0);
    });

    // Standard crash
    process.on('uncaughtException', (err) => {
        Logs.error(`UNCAUGHT EXCEPTION: ${err.stack}`);
    });

    // Killed process
    process.on('SIGTERM', () => {
        Logs.error('SIGTERM: Closing database and exiting...');
        process.reallyExit(0);
    });

    // Standard crash
    process.on('unhandledRejection', (err) => {
        Logs.error(`UNHANDLED REJECTION: ${err.stack}`);
    });

    // Deprecation warnings
    process.on('warning', (warning) => {
        Logs.warn(`WARNING: ${warning.name} : ${warning.message}`);
    });

    // Reference errors
    process.on('uncaughtReferenceError', (err) => {
        Logs.error(err.stack);
    });

};
