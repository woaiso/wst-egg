// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

import job from './job_mock';

export default class DribbbleController extends Controller {

  fetchJob() {
    const { ctx } = this;
    ctx.body = new ResponseJSON(0, 'success', {
      data: job,
    });
  }

  async fetchDribbbleTask() {
    const { ctx } = this;
    const { pageSize = 10, current = 1 } = ctx.request.query;
    const list = await ctx.model.DribbbleTask.find()
      .limit(+pageSize)
      .skip((+current - 1) * +pageSize)
      .sort({
        id: 'asc',
      });
    const total = await ctx.model.DribbbleTask.find().count();
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        pagination: {
          current: +current,
          total,
          pageSize: +pageSize,
        },
        list,
      },
    });
  }
}
