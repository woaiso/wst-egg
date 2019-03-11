// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class AutomatorController extends Controller {
  async show() {
    const { ctx } = this;
    const { id: name } = ctx.params;
    try {
      const automatorInfo = await ctx.service.automator.findAutomatorInfoByName(
        name
      );
      if(automatorInfo) {
        ctx.body = new ResponseJSON(0, 'success', {
            data: automatorInfo,
          });
      } else {
        ctx.body = new ResponseJSON(0, '未查询到该工具');
      }
    } catch (e) {
      ctx.body = new ResponseJSON(0, '未查询到该工具');
    }
  }

  async create() {
    const { ctx } = this;
    const {
      name,
      title,
      description,
      avatar,
      status,
      copyright,
      version,
      site,
      start,
      end,
      remark,
    } = ctx.request.body;

    try {
      const result = await ctx.service.automator.insertAutomator({
        name,
        title,
        description,
        avatar,
        status,
        copyright,
        version,
        site,
        start,
        end,
        remark,
      });
      if (result) {
        ctx.body = new ResponseJSON(0, '成功！');
      } else {
        ctx.body = new ResponseJSON(1001, '创建失败!请稍后重试');
      }
    } catch (e) {
        this.ctx.logger.error(e.message);
        ctx.body = { code: 401, message: e.message };
    }
  }
}
