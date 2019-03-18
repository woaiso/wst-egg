// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class DribbbleJobController extends Controller {
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
          ctx.body = new ResponseJSON(1001, '创建成功', { data: result });
        } else {
          ctx.body = new ResponseJSON(1001, '创建失败');
        }
      } else {
        ctx.body = new ResponseJSON(1001, `创建失败,${postParams.source} 已存在`);
      }
    } catch (e) {
      ctx.logger.error(e);
      ctx.body = new ResponseJSON(1001, e.message);
    }
  }

  async index() {
    const { ctx } = this;
    const data = await ctx.model.DribbbleJob.find().sort({ createAt: 'desc' });
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        inProcessing: 100,
        compelte: 20,
        averageTime: '20秒',
        list: data,
      },
    });
  }
}
