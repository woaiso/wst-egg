export default {
  schedule: {
    type: 'worker',
    cron: '*/10 * * * * *',
  },
  task: async (ctx) => {
    // ctx.logger.info('run cron task');
    ctx.service.dribbble.execTask();
  },
};
