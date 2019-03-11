
import { Service } from 'egg';
const uuidv4 = require('uuid/v4');

/**
 * user Service
 * 用户相关服务
 */
export default class UserService extends Service {
  /**
   * 使用账号密码创建账户
   * @param userName 账户名
   * @param password 密码
   */
  async createAccountByUsernamePassword(userName, password) {
    // 1. 检查用户名和密码是否合法
    // 2. 检查用户名是否存在
    if (await this.checkUserNameExists(userName)) {
      throw new Error(`账号已存在：${userName}`);
    }
    const user = {
      uuid: uuidv4(),
      userName,
      password,
      createAt: new Date().toLocaleString(),
      updateAt: new Date().toLocaleString(),
    };
    this.ctx.logger.info(`创建账户: ${userName}`);
    return this.ctx.model.Account.create(user);
  }

  /**
   * 检查用户名是否存在
   * @param userName 用户名
   */
  async checkUserNameExists(userName) {
    return this.ctx.model.Account.findOne({ userName: { $eq: userName } });
  }

  /**
   * 创建用户信息
   * @param userInfo 用户信息
   * @param account 账户信息
   */
  async createUserInfo(userInfo, account) {
    if (account) {
      const user = {
        uuid: account.uuid,
        nickName: userInfo.nickName || `用户 ${new Date().getTime()}`,
        avatar: userInfo.userInfo || '',
        gender: userInfo.gender || 0,
      };
      this.ctx.logger.info(`创建用户信息: ${account.userName}`);
      return this.ctx.model.User.create(user);
    } else {
      throw new Error('无关联的账户信息');
    }
  }

  // 1. 用户登录
  async findByUsernamePassword(userName, password) {
    // 对传入的password进行加密
    const user = this.ctx.model.Account.findOne({ userName: {$eq: userName}, password: {$eq: password} });
    return user;
  }
}
