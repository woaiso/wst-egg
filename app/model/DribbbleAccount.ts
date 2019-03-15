import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    account: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, default: 'not initialize' },
    nickname: { type: String, default: 'not initialize' },
    status: { type: Number, default: 0 },
    lastSignInAt: { type: Date },
    createAt: {
      type: Date,
      required: false,
    },
    updateAt: {
      type: Date,
      required: false,
    },
    credentials: {
      type: Array,
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
  return mongoose.model('dribbble_account', userSchema);
};
