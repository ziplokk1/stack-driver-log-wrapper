const logging = require('@google-cloud/logging');

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
     * If no project id is passed then it will use the default config from `gcloud init`.
     * If no resourceType is passed then it will use the global logger.
     * If no logName is passed then it will use the log name of default.
     *
     * @constructor
     * @param {Object} options        Options config.
     *
     * Options:
     *
     * @param {String} options.name           The logger name.
     * @param {String} options.resourceType   The logger resource type. See `type` field in documentation. (https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource)
     * @param {Object} options.resourceLabels The logger resource labels. See `labels` field in documentation. (https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource)
     * @param {Object} options.globalLabels   Custom labels to use for all log messages emitted from this logger. {labelName: labelValue [, labelName: labelValue]}
     * @param {Boolean} options.echo          Send messages to stdout as well.
     */
    constructor (options) {
        const defaultOptions = {
            projectId: 'default',
            name: 'default',
            resourceType: 'global',
            resourceLabels: {},
            globalLabels: {},
            echo: false
        };
        options = Object.assign(defaultOptions, options);
        let loggingApi;

        if (options.projectId === 'default') {
            loggingApi = logging();
        } else {
            loggingApi = logging({projectId: options.projectId});
        }
        this.name = options.name;
        this.resourceType = options.resourceType;
        this.resourceLabels = options.resourceLabels;
        this.globalLabels = options.globalLabels;
        this.echo = options.echo;
        this._logger = loggingApi.log(options.name);
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
        if (this.echo) {
            console.log(severity, message);
        }
        const entry = this.makeEntry(message, severity);
        return this._logger.write(entry, options);
    }

    alert (message, options) {
        return this.log(message, severity.ALERT, options)
    }

    critical (message, options) {
        return this.log(message, severity.CRITICAL, options)
    }

    debug (message, options) {
        return this.log(message, severity.DEBUG, options)
    }

    emergency (message, options) {
        return this.log(message, severity.EMERGENCY, options)
    }

    error (message, options) {
        return this.log(message, severity.ERROR, options)
    }

    info (message, options) {
        return this.log(message, severity.INFO, options)
    }

    notice (message, options) {
        return this.log(message, severity.NOTICE, options)
    }

    warning (message, options) {
        return this.log(message, severity.WARNING, options)
    }
}

module.exports = {
    Logger,
    severity
};