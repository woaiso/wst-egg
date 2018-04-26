import { Service } from 'egg';
import GithubAuth from './GithubAuth';

/**
 * user Service
 * 用户相关服务
 */
export default class User extends Service {

  /**
   * 用户登录
   * @param userName 用户名
   * @param password 密码
   */
  public async login(userName: string, password: string) {
    return `hi, ${userName} - ${password}`;
  }

  public getService(){
    return new GithubAuth().getUserService();
  }

}
