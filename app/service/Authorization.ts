import Auth, { AuthModel } from './../model/Auth';

export interface IAuth {
    login( auth: AuthModel ): Promise<any>;
}

export default class Authorization implements IAuth {
    /**
     * 用户登录
     * @param auth 登录信息
     */
    public login( auth: AuthModel ) {
        return new Promise( async ( resolve, reject ) => {
            // 1. check 数据库是否存在该用户
            const user = await Auth.find(auth);
            console.log(user);
            resolve(true);
        } );
    }
    /**
     * 创建新用户
     * @param auth 登录信息
     */
    public createUser( auth: AuthModel ) {
        return new Promise( ( resolve, reject ) => {
            Auth.create( auth ).then( () => resolve( true ), reject );
        } );
    }
}



