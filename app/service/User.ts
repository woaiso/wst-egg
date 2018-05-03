import { Service } from 'egg';
import Auth, { IAuthModel } from '../model/Auth';
import User, { Gender, IUserModel } from '../model/User';

/**
 * user Service
 * 用户相关服务
 */
export default class UserService extends Service {

  /**
   * 用户注册
   * @param userInfo 用户信息
   */
  public async register( userInfo: any ) {
    // 1. 判断用户来源
    const { provider } = userInfo;
    const dbUser = {} as IUserModel;
    const dbAuth = {} as IAuthModel;
    if ( provider === 'github' ) {
      // Auth 信息设置
      dbAuth.provider = provider; // 数据提供者
      dbAuth.githubId = userInfo.id; // githubID

      // 用户信息的设置
      dbUser.nickName = userInfo.displayName; // 昵称
      dbUser.avatar = userInfo.photo; // 头像
      dbUser.gender = Gender.UNKNOWN; // 性别未知
    }
    // 1. 向用户表写入一条数据
    const user = await User.create( dbUser );
    const auth = await Auth.create( dbAuth );
    return { user, auth };
  }
}
