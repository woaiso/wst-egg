import BaseController from './base';

export default class SystemController extends BaseController {
  /**
   * 登录
   */
  async initialDribbbleAccount() {
    const { ctx } = this;
    ctx.service.dribbble.initialAccount();
    ctx.body = '启动成功';
  }
  async fllow() {
    const account = await this.ctx.model.DribbbleAccount.findOne({ id: { $eq: 1 } });
    const job = await this.ctx.model.DribbbleJob.findOne({ id: { $eq: 1 } });
    const result = await this.ctx.service.worker.dribbble.fllow(account, job);
    return this.json(result);
  }
}
