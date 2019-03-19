import { Controller } from 'egg';

export default class SystemController extends Controller {
  /**
   * 登录
   */
  async initialDribbbleAccount() {
    const { ctx } = this;
    ctx.service.dribbble.initialAccount();
    ctx.body = '启动成功';
  }
}
