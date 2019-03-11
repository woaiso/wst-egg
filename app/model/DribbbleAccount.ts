import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    verifyPassWord: { type: String, required: true },
    avatar: { type: String },
    extra: { type: mongoose.Schema.Types.Mixed },
    userName: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  return mongoose.model('dribbble_account', userSchema);
};
