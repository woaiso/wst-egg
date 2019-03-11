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
    if ( !(this as any).createdAt ) {
        (this as any).createdAt = now;
    }
    (this as any).updateAt = now;
    next();
  })
  return mongoose.model('auth', userSchema);
};
