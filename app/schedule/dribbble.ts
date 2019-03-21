export default {
  schedule: {
    type: 'worker',
    cron: '0 */5 * * * *',
  },
  task: async (ctx) => {
    ctx.logger.info('run cron task');
    ctx.service.dribbble.execTask();
  },
};
