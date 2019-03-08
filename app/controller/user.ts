import { Controller } from 'egg';

export default class UserController extends Controller {
  /**
   * 登录
   */
  public async login() {
    return 'login';
  }
  /**
   * 注册
   */
  public async register() {
    return 'register';
  }
}
