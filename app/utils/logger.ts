import * as log4js from 'log4js';

const logger = log4js.getLogger();
logger.level = 'debug';

logger.info('info.....');

export default logger;
