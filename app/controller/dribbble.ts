// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

import account from './account_mock';
import job from './job_mock';

export default class DribbbleController extends Controller {
  dribbbleInfo() {
    const { ctx } = this;
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        name: 'dribbble-automator-tools',
        title: 'Dribbble自动工具',
        description: '用于处理dribbble自动登录，自动点赞、关注等操作',
        avatar: 'dribbble',
        status: 1,
        copyright: 'woaiso Inc.',
        version: '1.0.0',
        createAt: '2019-03-06',
        site: ['https://dribbble.com'],
        validity: '2019-01-01 ~ 2020-01-01',
        remark: '仅供学习研究使用，严禁用于商业用途',
        completeJobs: '832,98',
        running: '3天15小时',
      },
    });
  }

  fetchJobs() {
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
