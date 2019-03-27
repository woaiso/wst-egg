import * as $ from 'cheerio';
import * as cookie from 'cookie';

import { Service } from 'egg';
import request from './../../utils/request';

const DRIBBBLE_SESSION_KEY = '_dribbble_session';

const getCookie = (name, cookies: [string]) => {
  if (cookies && cookies.length > 0) {
    for (const cookieStr of cookies) {
      const ck = cookie.parse(cookieStr);
      if (ck[name]) {
        return ck[name];
      }
    }
  } else {
    return null;
  }
};

const createCookieStrForReques = (cookies: [string]) => {
  let cookieStr = '';
  if (cookies && cookies.length > 0) {
    for (const cookieItemStr of cookies) {
      const ck = cookie.parse(cookieItemStr);
      for (const c in ck) {
        if (!['path', 'expires'].includes(c)) {
          cookieStr += c + '=' + ck[c] + ';';
        }
      }
    }
    return cookieStr;
  } else {
    return null;
  }
};

export default class WorkerDribbble extends Service {
  getShotId(url) {
    const reg = /dribbble\.com\/shots\/([\s\S]+)\??/.exec(url);
    return reg ? reg[1] : null;
  }

  /**
   * 登录
   * @param {User} user 登录用户信息
   * {account: string, password: string, token: string}
   */
  async login(user) {
    const url = 'https://dribbble.com/session';
    const res = await request({
      url,
      method: 'POST',
      data: {
        utf8: '✓',
        authenticity_token: user.token,
        login: user.account,
        password: user.password,
      },
      headers: {
        cookie: user.session,
      },
    });
    const { status, headers } = res;
    if (status === 302 && headers.location === 'https://dribbble.com/') {
      this.ctx.logger.info(`dribbble login success: ${user.account}`);
      // 表明登录成功
      return headers['set-cookie'];
    } else {
      this.ctx.logger.warn(`dribbble login fail: ${user.account}`);
      return null;
    }
  }

  /**
   * 登录必须使用authtoken, dribbble_session
   * @returns
   * @memberof WorkerDribbble
   */
  async getAuthTokenAndSession() {
    const url = 'https://dribbble.com/session/new';
    try {
      const ret = await request({ url });
      if (ret) {
        const session = `${DRIBBBLE_SESSION_KEY}=${getCookie(
          DRIBBBLE_SESSION_KEY,
          ret.headers['set-cookie']
        )}`;
        const html = ret.data;
        const token = $(html)
          .find('[name="authenticity_token"]')
          .val();
        if (token) {
          return {
            session,
            token,
          };
        } else {
          throw new Error('未获取到 authenticity_token');
        }
      } else {
        return {
          session: null,
          token: null,
        };
      }
    } catch (e) {
      throw new Error(e);
    }
  }
  /**
   * 获取作品的详细信息
   * @param {string} shotUrl 作品URL
   */
  async getShotInfo(shotUrl, credentials?: any) {
    const headers = {} as any;
    if (credentials) {
      headers.cookie = createCookieStrForReques(credentials);
    }
    try {
      const res = await request({
        url: shotUrl,
        headers,
      });
      const html = res.data;
      const dom = $(html);
      const csrfToken = $.load(html)('meta[name=csrf-token]').attr('content');
      const maker = dom
        .find('span.shot-byline-user>a')
        .text()
        .trim();
      const title = dom
        .find('h1.shot-title')
        .text()
        .trim();
      const description = dom
        .find('div.shot-desc')
        .text()
        .trim();
      const likes = dom
        .find('div.shot-likes>a')
        .text()
        .trim()
        .replace(/[^\d]/g, '');
      const views = dom
        .find('div.shot-views')
        .children()
        .remove()
        .end()
        .text()
        .trim()
        .replace(/[^\d]/g, '');
      const saves = dom
        .find('div.shot-saves>a')
        .text()
        .trim()
        .replace(/[^\d]/g, '');
      const thumb = dom.find('.detail-shot').attr('data-img-src');
      if (csrfToken) {
        return {
          likes,
          views,
          saves,
          csrfToken,
          title,
          description,
          maker,
          thumb,
        };
      }
    } catch (e) {
      this.ctx.logger.error(e);
    }
    return null;
  }

  async getAuthorInfo(authorName, credentials?: any) {
    const headers = {} as any;
    if (credentials) {
      headers.cookie = createCookieStrForReques(credentials);
    }
    const url = `https://dribbble.com/${authorName.replace(/\s/g, '_')}`;
    this.ctx.logger.info(`getAuthorInfo:${url}`);
    const author = {} as any;
    try {
      const res = await request({ url, headers });
      const html = res.data;
      author.csrfToken = $.load(html)('meta[name=csrf-token]').attr('content');
    } catch (e) {
      this.ctx.logger.error(e);
    }
    return author;
  }
  /**
   * 点赞操作
   * @param {DribbbleAccount} account 需要操作的用户信息
   * @param {DribbbleJob} job 需要操作的任务信息
   */
  async like(account, job) {
    const { source } = job;
    let { credentials } = account;
    const { username } = account;
    const regex = /dribbble\.com\/shots\/([\s\S]+)\??/.exec(source);
    const shotId = regex && regex.length > 0 ? regex[1] : null;
    if (!shotId) {
      throw new Error('请检查任务');
    }
    const likeUrl = `https://dribbble.com/${username}/likes?screenshot_id=${shotId}`;
    if (!credentials || credentials.length === 0) {
      credentials = await this.getLoginCredentials(account);
    }
    // 先浏览页面获取到csrfToken
    const shotInfo = await this.getShotInfo(source, credentials);
    if(!shotId){
      return 0;
    }

    this.ctx.logger.info('获取Shot信息', JSON.stringify(shotInfo));
    const headers = {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
      'cache-control': 'no-cache',
      'content-length': 0,
      referer: source,
      origin: 'https://dribbble.com',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': shotInfo ? shotInfo.csrfToken : '',
      cookie: createCookieStrForReques(credentials),
    };
    try {
      const ret = await request({ url: likeUrl, method: 'POST', headers });
      const html = ret.data;
      const rex = html.match(/likes_count:\s(\d+)/);
      let num = 0;
      if (rex && rex.length > 1) {
        num = rex[1];
      }
      return num;
    } catch (e) {
      this.ctx.logger.error(e);
    }
  }
  /**
   * 获取登录凭证，首先查询是否存在可使用的凭证，不存在则登录获取，并存储到数据库
   *
   * @memberof WorkerDribbble
   */
  async getLoginCredentials(passport) {
    const { DribbbleAccount } = this.ctx.model;
    // 1. 查询当前账户下是否有可用的凭证
    const { credentials } = await DribbbleAccount.findOne({
      account: { $eq: passport.account },
    }).select('credentials');
    if (!credentials || credentials.length === 0) {
      // 需要走登录流程
      const { token, session } = await this.getAuthTokenAndSession();
      this.ctx.logger.info(`login token：${token}`);
      this.ctx.logger.info(`login session：${session}`);
      passport.token = token;
      passport.session = session;
      const credentialsArray = await this.login(passport);
      if (credentialsArray && credentialsArray.length > 0) {
        // 将凭证存入数据库
        await DribbbleAccount.findOneAndUpdate(
          { account: { $eq: passport.account } },
          {
            credentials: credentialsArray,
          }
        );
        return credentialsArray;
      } else {
        // 登录失败，更新账号状态
        await DribbbleAccount.findOneAndUpdate(
          { account: { $eq: passport.account } },
          {
            status: 3,
          }
        );
        return null;
      }
    } else {
      return credentials;
    }
  }
  /**
   * 获取用户信息
   * @param {User} passport 登录通行证 {account:string, password:string}
   */
  async getUserInfo(passport) {
    const credentials = await this.getLoginCredentials(passport);
    if (!credentials) {
      return null;
    }
    // 通过拉取登录后的首页数据获得个人信息
    const url = 'https://dribbble.com/';
    const res = await request({
      url,
      headers: {
        cookie: createCookieStrForReques(credentials),
      },
    });
    const html = res.data;
    const dom = $(html);
    const nickname = dom
      .find('span.profile-name')
      .text()
      .trim();
    const avatar = dom.find('#t-profile>a>img').attr('src');
    const username = dom
      .find('#t-profile>a')
      .attr('href')
      .replace(/\//g, '');
    // 获取用户的一些详细信息
    let user = { nickname, avatar, username } as any;
    try {
      const match = html.match(
        /Dribbble\.Segment\.identify\((\d+),\s+([^}]+})/
      );
      if (match && match.length > 2) {
        user.dribbble_uid = match[1];
        user = { ...user, ...JSON.parse(match[2]) };
      }
      this.ctx.logger.info(JSON.stringify(user));
      // 此处将用户信息重新设置并更新
      user = await this.ctx.model.DribbbleAccount.updateOne(
        {
          account: { $eq: passport.account },
        },
        {
          lastSignInAt: new Date(),
          status: 1,
          username,
          nickname,
          avatar,
        }
      );
    } catch (e) {
      this.ctx.logger.error(e);
    }
    return user;
  }

  /**
   * 关注作者
   *
   * @param {*} account
   * @param {*} job
   * @returns
   * @memberof WorkerDribbble
   */
  async fllow(account, job) {
    const { maker } = job;
    let { credentials } = account;
    const fllowUrl = `https://dribbble.com/${maker.replace(
      /\s/g,
      '_'
    )}/followers`;
    if (!credentials || credentials.length === 0) {
      credentials = await this.getLoginCredentials(account);
    }
    // 先浏览页面获取到csrfToken
    const authorInfo = await this.getAuthorInfo(maker, credentials);

    this.ctx.logger.info('获取Author信息', JSON.stringify(authorInfo));

    const headers = {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
      'cache-control': 'no-cache',
      'content-length': 0,
      referer: `https://dribbble.com/${maker.replace(/\s/g, '_')}`,
      origin: 'https://dribbble.com',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': authorInfo.csrfToken,
      cookie: createCookieStrForReques(credentials),
    };
    try {
      const ret = await request({ url: fllowUrl, method: 'POST', headers });
      if (+ret.status === 201) {
        this.ctx.logger.info(`fllow 成功 ${fllowUrl}`);
        return 1;
      } else {
        this.ctx.logger.info(`fllow 失败 ${fllowUrl}`);
      }
    } catch (e) {
      this.ctx.logger.info(`fllow 失败 ${fllowUrl} -  ${e.message}`);
    }
    return 0;
  }
}
