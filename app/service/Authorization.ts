import { Service } from 'egg';
import log from '../utils/logger';
import Auth, { IAuthModel } from '../model/Auth';

export interface IAuth {
    login( auth: IAuthModel ): Promise<any>;
}

export interface IGithubModel {
    provider: 'github';
}

export default class AuthorizationService extends Service implements IAuth {
    /**
     * 用户登录
     * @param auth 登录信息
     */
    public login( authInfo ) {
        return new Promise( async ( resolve, reject ) => {
            // log.info( JSON.stringify( authInfo, null, 2 ) );
            // 1. 判断provider
            const { provider } = authInfo;
            if ( provider === 'github' ) {
                // 1. check 数据库是否存在该用户
                const user = await Auth.findOne( {
                    provider,
                    githubId: authInfo.id,
                } );
                if ( user ) {
                    // 用户存在,查询用户信息返回
                    log.info( 'user exsist' );
                    resolve(user);
                } else {
                    // 用户不存在,执行注册逻辑
                    const dbUser =  await this.ctx.service.user.register(authInfo);
                    resolve(dbUser.user);
                }
            } else {
                reject('请求异常');
            }
        } );
    }
}
