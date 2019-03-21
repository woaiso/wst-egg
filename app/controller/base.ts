import { Controller } from 'egg';
import { Model } from 'mongoose';
import ResponseJSON from '../utils/ResponseJSON';

export default class BaseController extends Controller {
  protected json(data) {
    return (this.ctx.body = new ResponseJSON(0, 'success', data));
  }
  protected error(message) {
    return (this.ctx.body = new ResponseJSON(1001, message));
  }

  protected success(message, data?: any) {
    return (this.ctx.body = new ResponseJSON(0, message, data));
  }

  protected async pageSelect(model: Model<any>) {
    const { ctx } = this;
    const {
      pagination = { page_size: 20, current: 1 },
      sorter = { id: 'asc' },
      filters = {},
    } = ctx.request.body;
    const { page_size: pageSize, current } = pagination;
    const findFilter = {};
    if (filters) {
      for (const key of Object.keys(filters)) {
        if (Array.isArray(filters[key])) {
          findFilter[key] = { $in: filters[key] };
        } else {
          findFilter[key] = { $eq: filters[key] };
        }
      }
    }
    const list = await model
      .find(findFilter)
      .limit(+pageSize)
      .skip((+current - 1) * +pageSize)
      .sort(sorter);
    const total = await model.find(findFilter).count();
    return {
      pagination: {
        current: +current,
        total,
        page_size: +pageSize,
      },
      list,
    };
  }
}
