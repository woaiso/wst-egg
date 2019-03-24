import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    avatar: {
      type: String,
    },
    status: {
      type: Number,
      required: true,
    },
    copyright: {
      type: String,
      default: 'woaiso Inc.',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    site: {
      type: [String],
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    remark: {
      type: String,
    },
    // 系统启动时间点
    systemStartAt: {
      type: Date,
    },
    createAt: {
      type: Date,
      required: false,
    },
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
  userSchema.pre('save', function(next) {
    const now = new Date();
    if (!(this as any).createAt) {
      (this as any).createAt = now;
    }
    (this as any).updateAt = now;
    next();
  });
  return mongoose.model('automator', userSchema);
};
