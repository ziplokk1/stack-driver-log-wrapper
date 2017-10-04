const logging = require('@google-cloud/logging')();

const severity = {
    DEFAULT: 'DEFAULT',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    NOTICE: 'NOTICE',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
    ALERT: 'ALERT',
    EMERGENCY: 'EMERGENCY'
};

/**
 * Log wrapper for google's stack driver logs.
 *
 * @example
 * const logging = require('stack-driver-log-wrapper');
 * const myLogger = logging.Logger('MyLogName', 'cloud_function', {function_name: 'myCloudFunction'}, {someLabel: labelValue});
 * myLogger.info("Hello World");
 * // Or log info message like this...
 * myLogger.log("Hello World", logging.severity.INFO);
 */
class Logger {

    /**
     * Create a logger instance.
     *
     * @constructor
     * @param {String} name           The logger name.
     * @param {String} resourceType   The logger resource type. See `type` field in documentation. (https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource)
     * @param {Object} resourceLabels The logger resource labels. See `labels` field in documentation. (https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource)
     * @param {Object} globalLabels   Custom labels to use for all log messages emitted from this logger. {labelName: labelValue [, labelName: labelValue]}
     */
    constructor (name, resourceType, resourceLabels, globalLabels) {
        this.name = name;
        this.resourceType = resourceType;
        this.resourceLabels = resourceLabels || {};
        this._logger = logging.log(name);
        this.globalLabels = globalLabels || {};
    }

    /**
     * Create a log entry using the resource type and labels passed to this instance.
     *
     * See: (https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry)
     *
     * @param {String|Object} message   The message to log.
     * @param {String}        severity  The severity to use. See (https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity)
     * @returns {*}
     */
    makeEntry (message, severity) {
        const metadata = {
            resource: {
                type: this.resourceType,
                labels: this.resourceLabels
            },
            severity: severity
        };
        return this._logger.entry(metadata, message);
    }

    /**
     * Emit a message to stack driver logging.
     *
     * @param {String|Object} message  The message to send to stack driver.
     * @param {String}        severity The severity to use. See (https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity)
     * @param {Object}        options  Any overriding options to this logger. Any labels passed into the options take precedence over the options passed into the constructor. See (https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry)
     */
    log (message, severity, options) {

        // Make sure options exists.
        if (!options) {
            options = {};
        }

        // Make sure labels exist in the options so that we can assign our default options.
        if (!options.labels) {
            options.labels = {};
        }

        // Set the options to the defaults and make sure that any labels passed into this function
        // take precedence over the defaults.
        if (options && options.labels) {
            options.labels = Object.assign(this.globalLabels, options.labels);
        }

        const entry = this.makeEntry(message, severity);
        this._logger.write(entry, options)
            .then((data) => {
                // do nothing
            });
    }

    alert (message, labels) {
        this.log(message, severity.ALERT, labels)
    }

    critical (message, labels) {
        this.log(message, severity.CRITICAL, labels)
    }

    debug (message, labels) {
        this.log(message, severity.DEBUG, labels)
    }

    emergency (message, labels) {
        this.log(message, severity.EMERGENCY, labels)
    }

    error (message, labels) {
        this.log(message, severity.ERROR, labels)
    }

    info (message, labels) {
        this.log(message, severity.INFO, labels)
    }

    notice (message, labels) {
        this.log(message, severity.NOTICE, labels)
    }

    warning (message, labels) {
        this.log(message, severity.WARNING, labels)
    }
}

module.exports = {
    Logger,
    severity
};