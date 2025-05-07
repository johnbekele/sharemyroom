import dotenv from 'dotenv';

dotenv.config();

const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  warn: (...args) => {
    // Always log warnings, even in production
    console.warn(...args);
  },
  info: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args);
    }
  },
};

export default logger;
