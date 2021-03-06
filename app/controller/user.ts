import * as jwt from 'jsonwebtoken';

import ResponseJSON from '../utils/ResponseJSON';
import BaseController from './base';

export default class UserController extends BaseController {
  /**
   * 登录
   */
  async login() {
    const { ctx } = this;
    const { mail: username, password, type } = ctx.request.body;
    if (!username) {
      return (ctx.body = new ResponseJSON(400, '', { type }));
    }
    if (!password) {
      return (ctx.body = new ResponseJSON(400, '请输入正确的密码', { type }));
    }
    try {
      const account = await ctx.service.user.findByUsernamePassword(
        username,
        password
      );
      if (account) {
        // 登录成功 // 开始生成token
        const token = jwt.sign(
          { uuid: account.uuid },
          this.config.jwt.jwtSecret,
          {
            expiresIn: this.config.jwt.jwtExpire,
          }
        );
        ctx.set('authorization', token);
        return (ctx.body = new ResponseJSON(0, '登录成功!', {
          type,
          token,
          authority: ['admin'],
        }));
      } else {
        // 登录失败
        return (ctx.body = new ResponseJSON(
          403,
          '登录失败！请输入正确的账号密码',
          { type }
        ));
      }
    } catch (e) {
      ctx.logger.error('登录失败！');
      return (ctx.body = new ResponseJSON(403, '登录失败!', { type }));
    }
  }
  /**
   * 注册
   */
  async register() {
    const { ctx } = this;
    const {
      mail: username,
      password,
      invitation_code,
      nickname,
      avatar,
      gender,
    } = ctx.request.body;
    // 验证所有的信息是否符合规则
    if (!username) {
      return (ctx.body = new ResponseJSON(400, '请输入正确的用户名'));
    }
    if (!password) {
      return (ctx.body = new ResponseJSON(400, '请输入正确的密码'));
    }
    if (!nickname) {
      return (ctx.body = new ResponseJSON(400, '请输入正确的昵称'));
    }
    // 验证邀请码是否正确
    if (invitation_code !== '97379') {
      ctx.body = {
        code: 101,
        message: '请输入正确的邀请码',
      };
    } else {
      // todo
      try {
        const account = await ctx.service.user.createAccountByUsernamePassword(
          username,
          password
        );
        if (account) {
          ctx.logger.info(`账户注册成功！${account.userName}`);
          // 注册用户信息
          const user = await ctx.service.user.createUserInfo(
            {
              nickName: nickname,
              gender,
              avatar,
            },
            account
          );
          if (user) {
            // 用户信息写入成功
          } else {
            // 用户信息写入失败
            ctx.logger.error(`用户信息写入失败！${account.userName}`);
          }
          ctx.body = { code: 0, message: '注册成功' };
        } else {
          ctx.body = { code: 401, message: '注册失败！请重新操作' };
        }
      } catch (e) {
        this.ctx.logger.error(e.message);
        ctx.body = { code: 401, message: e.message };
      }
    }
  }

  async center() {
    const { ctx } = this;
    const { uuid } = ctx.request.header;
    const { User } = ctx.model;
    const user = await User.findOne({ uuid: { $eq: uuid } }).lean(true);
    user.avatar = 'https://cdn.dribbble.com/users/1569849/avatars/mini/6b12f9f730f77f68ffd2b2677fb05219.jpg';
    user.notifyCount = 0;
    user.unreadCount = 0;
    return this.json(user);
  }

  async notices() {
    return this.json([]);
  }
}
