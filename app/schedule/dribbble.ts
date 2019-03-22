export default {
  schedule: {
    type: 'worker',
    cron: '*/10 * * * * *',
  },
  task: async (ctx) => {
    ctx.service.dribbble.execTask();
  },
};
