export default {
  schedule: {
    type: 'worker',
    cron: '10/* * * * * *',
  },
  task: async (ctx) => {
    ctx.logger.info('执行定时任务');
    ctx.service.dribbble.execTask();
  },
};
