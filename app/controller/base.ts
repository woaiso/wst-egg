import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class BaseController extends Controller {
  protected json(data) {
    return (this.ctx.body = new ResponseJSON(0, 'success', data));
  }
  protected error(message) {
    return (this.ctx.body = new ResponseJSON(1001, message));
  }

  protected success(message) {
    return (this.ctx.body = new ResponseJSON(0, message));
  }
}
