// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class DribbbleJobController extends Controller {
  async create() {
    const { ctx } = this;
    const postParams = ctx.request.body;
    const dribbbleService = ctx.service.dribbble;
    try {
      if (!(await dribbbleService.findJobBySource(postParams.source))) {
        const result = await dribbbleService.createJob(postParams);
        if (result) {
          ctx.body = new ResponseJSON(0, '创建成功', { data: result });
        } else {
          ctx.body = new ResponseJSON(0, '创建失败');
        }
      } else {
        ctx.body = new ResponseJSON(0, `创建失败,${postParams.source} 已存在`);
      }
    } catch (e) {
      ctx.logger.error(e);
      ctx.body = new ResponseJSON(1001, e.message);
    }
  }

  async index() {
    const { ctx } = this;
    const data = await ctx.model.DribbbleJob.find();
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
