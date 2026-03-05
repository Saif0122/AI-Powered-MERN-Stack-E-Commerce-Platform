import env from '../config/env.js';

const RESET = '\x1b[0m';
const COLORS = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    debug: '\x1b[35m',   // Magenta
    dim: '\x1b[2m',      // Dim
};

const LEVELS = {
    info: 'INFO',
    success: 'OK  ',
    warn: 'WARN',
    error: 'ERR ',
    debug: 'DBG ',
};

const timestamp = () =>
    new Date().toISOString().replace('T', ' ').substring(0, 19);

const format = (level, message) => {
    const color = COLORS[level];
    const label = LEVELS[level];
    return `${COLORS.dim}[${timestamp()}]${RESET} ${color}${label}${RESET}  ${message}`;
};

const logger = {
    info: (msg) => console.log(format('info', msg)),
    success: (msg) => console.log(format('success', msg)),
    warn: (msg) => console.warn(format('warn', msg)),
    error: (msg) => console.error(format('error', msg)),
    debug: (msg) => {
        if (env.isDev) console.debug(format('debug', msg));
    },
};

export default logger;
