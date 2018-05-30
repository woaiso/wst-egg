
import { Document, Schema } from 'mongoose';
import Connection from '../db/connection';

/**
 * 性别
 * 
 * @export
 * @class Gender
 */
export class Gender {
    /**
     * 男性
     * @type {1}
     * @memberof Gender
     */
    static MALE: 1;
    /**
     * 女性
     * @type {2}
     * @memberof Gender
     */
    static FAMLE: 2;
    /**
     * 未知
     * @type {9}
     * @memberof Gender
     */
    static UNKNOWN: 9;

}

export interface IUserModel extends Document {
    userId?: string; // 用户ID
    nickName?: string; // 用户昵称
    avatar?: string; // 头像
    gender?: Gender;  // 性别
    createdAt: Date; // 创建时间
    modifiedAt: Date; // 最后修改时间
}

const schema = new Schema( {
    userId: {
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
    createdAt: {
        type: Date,
        required: false,
    },
    modifiedAt: {
        type: Date,
        required: false,
    },
} ).pre( 'save', function ( next ) {
    const doc = this as IUserModel;
    const now = new Date();
    if ( !doc.createdAt ) {
        doc.createdAt = now;
    }
    doc.modifiedAt = now;
    doc.userId = '1';
    next();
} );

const connection = new Connection().getConnection();
export default connection.model<IUserModel>( 'User', schema );
