// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

import account from './account_mock';
import job from './job_mock';

export default class DribbbleController extends Controller {

  fetchJob() {
    const { ctx } = this;
    ctx.body = new ResponseJSON(0, 'success', {
      data: job,
    });
  }

  fetchAccount() {
    const {ctx} = this;
    ctx.body = new ResponseJSON(0, 'success', {
      data: account,
    });
  }
}
