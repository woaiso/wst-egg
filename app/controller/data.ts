// 数据相关


import BaseController from './base';

export default class DataController extends BaseController {

  async getPosts() {
    const { ctx } = this;
    const {
      pagination = { page_size: 20, current: 1 },
      sorter = { id: 'descending' },
      filters = {},
    } = ctx.request.body;
    const { page_size: pageSize, current } = pagination;
    const findFilter = {} as any;
    if (filters) {
      for (const key of Object.keys(filters)) {
        findFilter[key] = { $in: filters[key] };
      }
    }
    const list = await ctx.model.Post.find(findFilter)
      .limit(+pageSize)
      .skip((+current - 1) * +pageSize)
      .sort(sorter);
    const total = await ctx.model.Post.find(findFilter).count();
    return this.json({
      pagination: {
        current: +current,
        total,
        page_size: +pageSize,
      },
      list,
    });
  }
}
