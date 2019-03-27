export default {
  schedule: {
    type: 'worker',
    cron: '* */5 * * * *',
  },
  task: async (ctx) => {
    ctx.service.dribbble.execTask();
  },
};
