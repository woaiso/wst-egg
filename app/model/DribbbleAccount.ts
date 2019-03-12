import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    account: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String},
    nickname: { type: String },
    status: { type: Number, default: 1 },
    lastSignInAt: { type: Date },
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
  return mongoose.model('dribbble_account', userSchema);
};
