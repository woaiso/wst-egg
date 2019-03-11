import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';
export default class AuthController extends Controller {
  authRoutes() {
    const { ctx } = this;
    ctx.body = new ResponseJSON(0, 'success', {
      route: { '/automator/dribbble': { authority: ['admin', 'user'] } },
    });
  }
}
