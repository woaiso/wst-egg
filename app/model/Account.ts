import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: {
      // 自增ID
      type: Number,
      required: false,
    },
    uuid: {
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
    createAt: {
      type: Date,
      required: false,
    },
    updateAt: {
      type: Date,
      required: false,
    },
  });
  return mongoose.model('account', userSchema);
};
