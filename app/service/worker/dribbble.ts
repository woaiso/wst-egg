import * as $ from 'cheerio';

import { Service } from 'egg';
import request from './../../utils/request';

export default class WorkerDribbble extends Service {
  getShotId(url) {
    const reg = /dribbble\.com\/shots\/([\s\S]+)\??/.exec(url);
    return reg ? reg[1] : null;
  }

  /**
   * 登录
   * @param {User} user 登录用户信息
   * {name: string, password: string, token: string}
   */
  async login(user) {
    const url = 'https://dribbble.com/session';
    return new Promise((resolve, reject) => {
      request({
        url,
        method: 'POST',
        data: {
          utf8: '✓',
          authenticity_token: user.token,
          login: user.name,
          password: user.password,
        },
      }).then(res => {
        const html = res.data;
        const dom = $(html);
        const nickName = dom.find('.profile-name').text();
        if (nickName && nickName !== '') {
          const userName = dom
            .find('#t-profile .has-sub')
            .attr('href')
            .replace(/^\//, '');
          resolve({ userName, nickName });
        } else {
          reject('账号密码错误');
        }
      }, reject);
    });
  }

  /**
   * 登录必须使用authtoken
   * @returns
   * @memberof WorkerDribbble
   */
  async getAuthToken() {
    const url = 'https://dribbble.com/session/new';
    try {
      const ret = await request({ url });
      if (ret) {
        const html = ret.data;
        const token = $(html)
          .find('[name="authenticity_token"]')
          .val();
        if (token) {
          return token;
        } else {
          throw new Error('未获取到 authenticity_token');
        }
      } else {
        return null;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
  /**
   * 获取作品的详细信息
   * @param {string} shotUrl 作品URL
   */
  async getShotInfo(shotUrl): Promise<any> {
    return new Promise((resolve, reject) => {
      request({
        url: shotUrl,
      }).then(res => {
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
          resolve({
            likes,
            views,
            saves,
            csrfToken,
            title,
            description,
            maker,
            thumb,
          });
        } else {
          reject('未获取到csrfToken');
        }
      }, reject);
    });
  }
  /**
   * 点赞
   * @param {string} userName 当前登录用户的ID
   * @param {string} screenshotId 作品ID
   * @param {string} referer 当前作品的URL
   */
  async like(userName, screenshotId, referer, csrfToken) {
    const url = `https://dribbble.com/${userName}/likes?screenshot_id=${screenshotId}`;
    return new Promise((resolve, reject) => {
      request({
        url,
        method: 'POST',
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
          'cache-control': 'no-cache',
          'content-length': 0,
          referer: referer,
          'x-requested-with': 'XMLHttpRequest',
          origin: 'https://dribbble.com',
          'x-csrf-token': csrfToken,
        },
      }).then(res => {
        const html = res.data;
        const num = $(html)
          .find('.stats-num')
          .children()
          .remove()
          .end()
          .text()
          .trim();
        resolve(num);
      }, reject);
    });
  }
  /**
   * 登录并获取用户信息
   * @param {User} passport 登录通行证 {name:string, password:string}
   */
  async getUserInfo(passport): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const token = await this.getAuthToken();
      passport = { ...passport, token };
      try {
        const userInfo = await this.login(passport);
        if (userInfo) {
          resolve(userInfo);
        } else {
          reject(new Error('未获取到正确的用户信息'));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * 点赞
   * @param {string} shotUrls 作品链接
   * @param {User} user 登录的用户信息
   */
  async rate(shotUrls = [], user) {
    return new Promise(async (resolve, reject) => {
      if (shotUrls && user) {
        try {
          const userInfo = await this.getUserInfo(user);
          return Promise.all(
            shotUrls.map(async url => {
              const {
                csrfToken,
                likes,
                views,
                buckets,
              } = await this.getShotInfo(url);
              console.log(likes, views, buckets);
              const likeNum = await this.like(
                userInfo.userName,
                this.getShotId(url),
                url,
                csrfToken
              );
              resolve(likeNum);
            })
          );
        } catch (e) {
          reject('处理失败');
        }
      } else {
        return Promise.reject('请传入正确的URL和用户');
      }
    });
  }
}
