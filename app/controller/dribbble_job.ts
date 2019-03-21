// 自动化工具

import BaseController from './base';

export default class DribbbleJobController extends BaseController {
  async create() {
    const { ctx } = this;
    const postParams = ctx.request.body;
    // 对参数做一些处理

    const {
      time_range: timeRange,
      like_enable: likeEnable,
      fllow_enable: fllowEnable,
      proxy_enable: proxyEnable,
      source,
    } = postParams;
    const dribbbleService = ctx.service.dribbble;
    try {
      if (!(await dribbbleService.findJobBySource(postParams.source))) {
        const result = await dribbbleService.createJob({
          source,
          timeRange,
          likeEnable,
          fllowEnable,
          proxyEnable,
        });
        if (result) {
          // 接着创建定时任务用于执行真实操作
          await dribbbleService.createTask(result);
          return this.success('创建成功', result);
        } else {
          return this.error('创建失败');
        }
      } else {
        return this.error('创建失败,${postParams.source} 已存在');
      }
    } catch (e) {
      ctx.logger.error(e);
      return this.error(e.message);
    }
  }

  async index() {
    const { ctx } = this;
    const list = await ctx.model.DribbbleJob.find().sort({ createAt: 'desc' });
    const count = await ctx.model.DribbbleJob.find().count();
    // 计算有多少任务已经完成
    return this.json({
      inProcessing: count,
      compelte: list.filter((item) => item.processed === item.all).length,
      averageTime: '5秒',
      list,
    });
  }

  async new() {
    const { ctx } = this;
    await ctx.service.dribbble.execTask();
    ctx.body = '完成';
  }
}
