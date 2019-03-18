import { Application } from 'egg';
export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: {
      // 自增ID
      type: Number,
      required: false,
    },
    // 任务信息
    jobId: {
      type: Number,
      required: true,
    },
    // 账号信息
    accountId: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      default: -1,
    },
    // 任务耗时
    totalTime: {
      type: Number,
    },
    // 开始时间
    startTime: {
      type: Date,
    },
    // 执行了什么动作
    action: {
      type: Array,
    },
    // 创建时间
    createAt: {
      type: Date,
      required: false,
    },
    // 最后更新时间
    updateAt: {
      type: Date,
      required: false,
    },
  });
  // tslint:disable-next-line:only-arrow-functions
  userSchema.pre('update', function() {
    this.update({}, { $set: { updatedAt: new Date() } });
  });
  // tslint:disable-next-line:only-arrow-functions
  userSchema.pre('save', async function(next) {
    const now = new Date();
    if (!(this as any).createAt) {
      (this as any).createAt = now;
    }
    (this as any).updateAt = now;
    next();
  });
  return mongoose.model('dribbble_task', userSchema);
};
