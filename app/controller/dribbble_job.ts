// 自动化工具

import BaseController from './base';

export default class DribbbleJobController extends BaseController {
  public async create() {
    const { ctx } = this;
    const postParams = ctx.request.body;
    // 对参数做一些处理

    const {
      time_range: timeRange,
      like_enable: likeEnable,
      fllow_enable: fllowEnable,
      proxy_enable: proxyEnable,
      like_num: likeNum,
      fllow_num: fllowNum,
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
          likeNum,
          fllowNum,
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

  public async list() {
    const { ctx } = this;
    const list = await ctx.model.DribbbleJob.find({ status: { $eq: 1 } }).sort({
      createAt: 'desc',
    });
    const count = await ctx.model.DribbbleJob.find().count();
    const compelte = list.filter(item => item.processed === item.all).length;
    const avgs = await ctx.model.DribbbleTask.aggregate([
      { $group: { _id: '$status', averageTime: { $avg: '$totalTime' } } },
    ]);
    const averageTime = avgs
      .filter(item => item._id === 1)[0]
      .averageTime.toFixed(2);
    // 计算有多少任务已经完成
    return this.json({
      inProcessing: count - compelte,
      compelte,
      averageTime: `${averageTime}秒`,
      list,
    });
  }

  async new() {
    const { ctx } = this;
    await ctx.service.dribbble.execTask();
    ctx.body = '完成';
  }

  /**
   * 删除任务
   *
   * @memberof DribbbleJobController
   */
  async update() {
    const { ctx } = this;
    const { action, id } = ctx.request.body;
    if (action === 'pause') {
      const ret = await ctx.service.dribbble.pauseJob(id);
      if (ret) {
        return this.success('暂停成功');
      } else {
        return this.error('暂停失败');
      }
    } else if (action === 'delete') {
      const ret = await ctx.service.dribbble.deleteJob(id);
      if (ret) {
        return this.success('删除成功');
      } else {
        return this.error('删除失败');
      }
    } else {
      return this.error('参数错误');
    }
  }
}
