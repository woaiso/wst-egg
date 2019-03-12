// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class DribbbleAccountController extends Controller {
  async create() {
    const { ctx } = this;
    const postParams = ctx.request.body;
    try {
      const result = await ctx.service.dribbble.createAccounnt(postParams);
      if (result) {
        ctx.body = new ResponseJSON(0, '创建成功');
      } else {
        ctx.body = new ResponseJSON(0, '创建失败');
      }
    } catch (e) {
      ctx.logger.error(e);
      ctx.body = new ResponseJSON(1001, e.message);
    }
  }
}
