import { Application } from 'egg';

export default (app: Application) => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    id: {
      type: String,
    },
    text: {
      type: String,
    },
    post_at: {
      type: String,
    },
    note_count: {
      type: Number,
    },
    images: {
      type: Array,
    },
    videos: {
      type: Array,
    },
  });
  return mongoose.model('post', userSchema, 'post');
};
