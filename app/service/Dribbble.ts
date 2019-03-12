import { Service } from 'egg';

export default class DribbbleService extends Service {
  async createAccounnt(account) {
    return this.ctx.model.DribbbleAccount.insertMany(account);
  }
}
