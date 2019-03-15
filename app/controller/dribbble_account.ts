// 自动化工具

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

const maxBatchCount = 50;

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
          ctx.body = new ResponseJSON(
            0,
            `操作完成，共写入${result.success.length}条数据，写入错误${
              result.error.length
            }条，已存在${result.exists.length}条`,
            { data: result }
          );
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
    const {
      page_size: pageSize = 10,
      current_page: currentPage = 1,
    } = ctx.request.query;
    const list = await ctx.model.DribbbleAccount.find()
      .limit(+pageSize)
      .skip((+currentPage - 1) * +pageSize)
      .sort({
        id: 'asc',
      });
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        page_size: pageSize,
        current_page: currentPage,
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
