import * as mongoose from 'mongoose';
import config from './../config';

const mongoConfig = config.mongo;
/**
 * 用于处理数据库的访问
 */

export default class Connection {
    private connection: mongoose.Connection | null = null;
    /**
     * 获取一个连接
     */
    constructor() {
        if ( null === this.connection ) {
            const mongodbScheme = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;
            mongoose.connect( mongodbScheme );
            this.connection = mongoose.connection;
            this.connection.on( 'error', console.error.bind( console, 'connection error:' ) );
            this.connection.once( 'open', () => {
                // we're connected!
            } );
        }
    }
    getConnection() {
        return mongoose;
    }
}
