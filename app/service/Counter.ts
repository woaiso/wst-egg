import { Service } from 'egg';

export default class CounterService extends Service {
  async getNextSequence(name) {
    const ret = await this.ctx.model.Counter.findOneAndUpdate(
      { _id: name },
      {
        $inc: { seq: 1 },
      },
      {upsert: true, new: true}
    );
    return ret ? ret.seq : 0;
  }
}
