import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false, // 第三方登录可能无登录名
    },
    password: {
      type: String,
      required: false, // 第三方登录可能无密码
    },
    provider: {
      type: String,
      required: false,
    },
    githubId: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      required: false,
    },
    modifiedAt: {
      type: Date,
      required: false,
    },
  });
  return mongoose.model('auth', userSchema);
};
