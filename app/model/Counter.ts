import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
      _id: {
          type: String
      },
      seq: {
          type: Number,
          defualt: 0
      }
  });
  return mongoose.model('counter', userSchema);
};
