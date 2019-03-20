// 自动化工具


import BaseController from './base';

export default class DribbbleController extends BaseController {

  async fetchDribbbleTask() {
    return this.json(await this.pageSelect(this.ctx.model.DribbbleTask));
  }
}
