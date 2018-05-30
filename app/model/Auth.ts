import { Document, Schema } from 'mongoose';
import Connection from '../db/connection';

export interface IAuthModel extends Document {
    userId?: string;
    userName: string;
    password: string;
    provider?: 'github' | '';
    githubId?: string;
    createdAt: Date;
    modifiedAt: Date;
}

const schema = new Schema({
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

const connection = new Connection().getConnection();
export default  connection.model<IAuthModel>('Auth', schema);
