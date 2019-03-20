// 自动化工具

import ResponseJSON from '../utils/ResponseJSON';
import BaseController from './base';

const maxBatchCount = 500;

export default class DribbbleAccountController extends BaseController {
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
              ctx.body = new ResponseJSON(1001, '添加失败，请检查后重试');
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
    const {
      pagination = { page_size: 20, current: 1 },
      sorter = { id: 'descending' },
      filters = {},
    } = ctx.request.body;
    const { page_size: pageSize, current } = pagination;
    const findFilter = {};
    if (filters) {
      for (const key of Object.keys(filters)) {
        findFilter[key] = { $in: filters[key] };
      }
    }
    const list = await ctx.model.DribbbleAccount.find(findFilter)
      .limit(+pageSize)
      .skip((+current - 1) * +pageSize)
      .sort(sorter);
    const total = await ctx.model.DribbbleAccount.find(findFilter).count();
    ctx.body = new ResponseJSON(0, 'success', {
      data: {
        pagination: {
          current: +current,
          total,
          page_size: +pageSize,
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

  async delete() {
    const { ids = [] } = this.ctx.request.body;
    const { DribbbleAccount } = this.ctx.model;
    if (status && ids && ids.length > 0) {
      try {
        const ret = await DribbbleAccount.deleteMany({ id: { $in: ids } });
        if (ret) {
          return this.success('删除成功');
        } else {
          return this.error('删除失败');
        }
      } catch (e) {
        return this.error('操作失败');
      }
    } else {
      return this.error('参数错误');
    }
  }

  /**
   * 暂停账户使用
   *
   * @memberof DribbbleAccountController
   */
  async changeStatus() {
    const { status = 2, ids = [] } = this.ctx.request.body;
    const { DribbbleAccount } = this.ctx.model;
    if (status && ids && ids.length > 0) {
      try {
        const message = [] as string[];
        for (const id of ids) {
          const account = await DribbbleAccount.findOne({
            id: { $eq: id },
          }).select('credentials');
          if (+status === 2) {
            // 表示要将账号暂停使用
            await DribbbleAccount.updateOne({ id: { $eq: id } }, { status });
            message.push(`${id}:暂停成功`);
          } else if (+status === 1) {
            // 表示要将账号启用，启用账号必须保证当前有登录信息
            if (account.credentials && account.credentials.length > 0) {
              // 可以操作
              await DribbbleAccount.updateOne({ id: { $eq: id } }, { status });
              message.push(`${id}:启用成功`);
            } else {
              // 不允许操作
              message.push(`${id}:未初始化或登录信息错误不允许启用`);
            }
          }
        }
        return this.success('操作成功');
      } catch (e) {
        return this.error('操作失败');
      }
    } else {
      return this.error('参数错误');
    }
  }
}
