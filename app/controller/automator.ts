// 自动化工具

import { distanceInWords } from 'date-fns';
import * as zh_CN from 'date-fns/locale/zh_cn';

import BaseController from './base';

export default class AutomatorController extends BaseController {
  async getInfo() {
    const { ctx } = this;
    const { name } = ctx.query;
    try {
      const automatorInfo = await ctx.service.automator.findAutomatorInfoByName(
        name
      );
      // 查询其他信息
      if (automatorInfo) {
        const data = automatorInfo as any;
        try {
          data.running = distanceInWords(data.systemStartAt, new Date(), {
            includeSeconds: true,
            locale: zh_CN,
          });
        } catch (e) {
          console.error(e);
        }
        data.completeJobs = await ctx.model.DribbbleTask.count({
          status: { $eq: 1 },
        });
        return this.json(data);
      } else {
        return this.error('未查询到该工具');
      }
    } catch (e) {
      return this.error('未查询到该工具');
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
        return this.success('成功');
      } else {
        return this.error('创建失败!请稍后重试');
      }
    } catch (e) {
      this.ctx.logger.error(e.message);
      ctx.body = { code: 401, message: e.message };
    }
  }
}
