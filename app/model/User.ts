
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
    uuid?: string; // 用户ID
    nickName?: string; // 用户昵称
    avatar?: string; // 头像
    gender?: Gender;  // 性别
    createAt: Date; // 创建时间
    updateAt: Date; // 最后修改时间
}

const schema = new Schema( {
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
} ).pre( 'save', function ( next ) {
    const doc = this as IUserModel;
    const now = new Date();
    doc.updateAt = now;
    next();
} );

const connection = new Connection().getConnection();
export default connection.model<IUserModel>( 'user', schema );
