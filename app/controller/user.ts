import { Controller } from 'egg';

export default class UserController extends Controller {
  /**
   * 登录
   */
  async login() {
    const { ctx } = this;
    ctx.body = 'login';
  }
  /**
   * 注册
   */
  async register() {
    const { ctx } = this;
    ctx.body = 'register';
  }
}
