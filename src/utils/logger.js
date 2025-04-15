const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4, // To disable logging in production, for example
  };
  
  const currentLogLevel = process.env.NODE_ENV === 'production' ? logLevels.info : logLevels.debug;
  
  const formatLogMessage = (level, message, ...args) => {
    const now = new Date().toLocaleTimeString();
    return `[${now}] ${level.toUpperCase()}: ${message} ${args.length > 0 ? args.join(' ') : ''}`;
  };
  
  export const logger = {
    debug: (message, ...args) => {
      if (currentLogLevel <= logLevels.debug) {
        console.debug(formatLogMessage('debug', message, ...args));
      }
    },
    info: (message, ...args) => {
      if (currentLogLevel <= logLevels.info) {
        console.info(formatLogMessage('info', message, ...args));
      }
    },
    warn: (message, ...args) => {
      if (currentLogLevel <= logLevels.warn) {
        console.warn(formatLogMessage('warn', message, ...args));
      }
    },
    error: (message, ...args) => {
      if (currentLogLevel <= logLevels.error) {
        console.error(formatLogMessage('error', message, ...args));
      }
    },
  };
  
  export default logger;