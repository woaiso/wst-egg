// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

const maxBatchCount = 500;

export default class DribbbleAccountController extends Controller {
  async create() {
    const { ctx } = this;
    const postParams = ctx.request.body;
    if (Array.isArray(postParams)) {
      // 必须为一个数组，允许的最大添加数量
      if (postParams.length > maxBatchCount) {
        ctx.body = new ResponseJSON(
          1001,
          `批量添加最大支持${maxBatchCount}条数据`
        );
      } else {
        try {
          const result = await ctx.service.dribbble.createAccounnt(postParams);
          // 接下来去尝试登录初始化用户的账户信息，
          // 仅会初始化不存在的账号，已存在的账号将不被初始化
          // 如果仅添加了一个账号，则等待账户信息初始化完成后再响应前端
          ctx.service.dribbble.fillAccountInfo(postParams);
          if (postParams.length === 1) {
            if (result.success.length === 1) {
              // 添加成功
              ctx.body = new ResponseJSON(
                0,
                '添加成功,用户信息正在后台确认并初始化，请稍后查询'
              );
            } else {
              // 添加失败
              ctx.body = new ResponseJSON(
                1001,
                '添加失败，请检查后重试'
              );
            }
          } else {
            // 大于1直接返回添加结果，在后台慢慢初始化信息
            ctx.body = new ResponseJSON(
              0,
              `操作完成，共写入${result.success.length}条数据，写入错误${
                result.error.length
              }条，已存在${
                result.exists.length
              }条。用户信息正在后台确认并初始化，请稍后查询`,
              { data: result }
            );
          }
        } catch (e) {
          ctx.logger.error(e);
          ctx.body = new ResponseJSON(1001, e.message);
        }
      }
    } else {
      ctx.body = new ResponseJSON(1001, '参数错误');
    }
  }

  async index() {
    const { ctx } = this;
    const { pageSize = 10, current = 1 } = ctx.request.query;
    const list = await ctx.model.DribbbleAccount.find()
      .limit(+pageSize)
      .skip((+current - 1) * +pageSize)
      .sort({
        id: 'asc',
      });
    const total = await ctx.model.DribbbleAccount.find().count();
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        pagination: {
          current: +current,
          total,
          pageSize: +pageSize,
        },
        list,
      },
    });
  }

  async getUserInfo() {
    const { ctx } = this;
    const { account, password } = ctx.request.query;
    try {
      ctx.body = await ctx.service.dribbble.getUserInfoByAccountAndPassword(
        account,
        password
      );
    } catch (e) {
      this.ctx.logger.error(e);
      ctx.body = new ResponseJSON(1001, e.message);
    }
  }
}
