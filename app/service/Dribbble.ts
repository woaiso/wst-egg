import { Service } from 'egg';

export default class DribbbleService extends Service {
  /**
   *
   * 批量添加Dribbble账户信息
   * @param {Array<DribbbleAccount>} accounts 账户信息列表
   * @returns
   * @memberof DribbbleService
   */
  async createAccounnt(accounts) {
    const successQueue = [] as any[]; // 成功添加
    const existsQueue = [] as any[]; // 已存在
    const errorQueue = [] as any[]; // 错误队列
    // 这里来处理批量添加的逻辑
    for (const account of accounts) {
      // 排查当前账号是否已存在数据库
      if (!(await this.findDribbbleAccountByAccount(account.account))) {
        account.id = await this.ctx.service.counter.getNextSequence(
          'dribbble_account'
        );
        try {
          const result = await this.ctx.model.DribbbleAccount.create(account);
          if (result) {
            successQueue.push(account.account);
          } else {
            errorQueue.push(account.account);
          }
        } catch (e) {
          this.ctx.logger.error(e.message);
          errorQueue.push(account.account);
        }
      } else {
        this.ctx.logger.info(`dribbble_account exists：${account.account}`);
        existsQueue.push(account.account);
      }
    }
    return {
      success: successQueue,
      error: errorQueue,
      exists: existsQueue,
    };
  }

  /**
   * 查询是否存在账户信息
   *
   * @param {*} account
   * @returns
   * @memberof DribbbleService
   */
  async findDribbbleAccountByAccount(account) {
    return this.ctx.model.DribbbleAccount.findOne({
      account: { $eq: account },
    }).exists(account, false);
  }
  async createJob(job) {
    const dribbbleWorker = this.ctx.service.worker.dribbble;
    try {
      const info = await dribbbleWorker.getShotInfo(job.source);
      job = { ...job, ...info };
    } catch (e) {
      throw new Error('未获取到Shot信息，请检查后重试');
    }
    job.id = await this.ctx.service.counter.getNextSequence('dribbble_job');
    return this.ctx.model.DribbbleJob.create(job);
  }

  async findJobBySource(source) {
    return this.ctx.model.DribbbleJob.findOne({ source: { $eq: source } });
  }
}
