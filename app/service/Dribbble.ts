import { Service } from 'egg';

export default class DribbbleService extends Service {
  async createAccounnt(account) {
    return this.ctx.model.DribbbleAccount.insertMany(account);
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
