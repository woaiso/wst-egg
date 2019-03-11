import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: false,
    },
    nickName: {
        type: String,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    gender: {
        type: Number,
        required: false,
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
  return mongoose.model('user', userSchema);
};
