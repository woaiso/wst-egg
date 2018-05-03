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
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
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
