import { Application } from 'egg';
export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: {
      // 自增ID
      type: Number,
      required: false,
    },
    source: {
      type: String,
      required: true,
      validate: {
        validator: v => {
          return /https:\/\/dribbble\.com\/shots\/([\s\S]+)/.test(v);
        },
        message:
          '请输入正确的dribbble url example：https://dribbble.com/shots/6160500-Card-Paginator-Component',
      },
    },
    // 状态
    status: {
      type: Number,
      default: 1,
    },
    // 多少小时内完成任务
    timeRange: {
      type: Number,
      required: true,
    },
    // 启用点赞
    likeEnable: {
      type: Number,
      default: 0,
    },
    // 启用关注
    fllowEnable: {
      type: Number,
      default: 0,
    },
    // 点赞数量
    likeNum: {
      type: Number,
      default: 0,
    },
    // 关注数量
    fllowNum: {
      type: Number,
      default: 0,
    },
    // 启用代理
    proxyEnable: {
      type: Number,
      default: 0,
    },
    // 已完成任务数量
    processed: {
      default: 0,
      type: Number,
    },
    // 任务总量
    all: {
      default: 0,
      type: Number,
    },
    // Dribbble 作者
    maker: {
      type: String,
    },
    // Dribbble 标题
    title: {
      type: String,
    },
    // Dribbble 描述
    description: {
      type: String,
    },
    // Dribbble 缩略图
    thumb: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
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
  return mongoose.model('dribbble_job', userSchema);
};
