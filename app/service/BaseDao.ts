import { connect, connection, Connection } from 'mongoose';
import config from './../config';

const mongoConfig = config.mongo;
/**
 * 用于处理数据库的访问
 */

export default class BaseDao {
    private db: Connection;
    constructor() {
        const mongodbScheme = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;
        connect( mongodbScheme );
        this.db = connection;
        this.db.on( 'error', console.error.bind( console, 'connection error:' ) );
        this.db.once( 'open',  () => {
            // we're connected!
        } );
    }
}
