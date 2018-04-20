import { Controller } from 'egg';

export default class UserController extends Controller {
  public async index() {
    const { ctx } = this;
    ctx.body = '<h1>/user</h1>';
  }
}
