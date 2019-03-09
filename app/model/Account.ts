import { Document, Schema } from 'mongoose';
import Connection from '../db/connection';

export interface IAccountModel extends Document {
    uuid?: string;
    userName: string;
    password: string;
    createAt: Date;
    updateAt: Date;
}

const schema = new Schema({
    id: { // 自增ID
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

const connection = new Connection().getConnection();
export default  connection.model<IAccountModel>('account', schema);
