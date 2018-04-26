import { Document, Schema } from 'mongoose';
import Connection from '../db/connection';

export interface AuthModel extends Document {
    userId?: string;
    userName: string;
    password: string;
    provider?: 'github' | '';
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
});

const connection = new Connection().getConnection();
export default  connection.model<AuthModel>('Auth', schema);
