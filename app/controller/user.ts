import * as jwt from 'jsonwebtoken';

import { Controller } from 'egg';
import ResponseJSON from '../utils/ResponseJSON';

export default class UserController extends Controller {
  /**
   * 登录
   */
  async login() {
    const { ctx } = this;
    const { mail: username, password, type } = ctx.request.body;
    if (!username) {
      return (ctx.body = new ResponseJSON(400, '请输入正确的用户名', { type }));
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
    if (invitation_code !== '888') {
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
    ctx.body = {
      name: 'SuperK',
      avatar: 'https://images-cdn.shimo.im/d1MvrSV3u2UOXqgw/601504753662_.pic.jpg!avatar',
      userid: '00000001',
      email: 'antdesign@alipay.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        { key: '0', label: '很有想法的' },
        { key: '1', label: '专注设计' },
        { key: '2', label: '辣~' },
        { key: '3', label: '大长腿' },
        { key: '4', label: '川妹子' },
        { key: '5', label: '海纳百川' },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      geographic: {
        province: { label: '浙江省', key: '330000' },
        city: { label: '杭州市', key: '330100' },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    };
  }
}
