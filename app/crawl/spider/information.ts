import Spider from './spider';

interface ISpider {
  fetch(path: string, data?: any): Promise<any>;
}

/**
 * 资讯类蜘蛛
 */

export default class Information extends Spider implements ISpider {
  // 参数配置
  options: any;
  constructor(options = {}) {
    super();
    const defaultOptions = {
      data: {
        // 访客
        token: 'guest',
        guest_id: '795-6422',
      },
      headers: {
        'Authorization': 'IVWEN 6d69d2a8f76d10cc5279adbe27d4b656',
        'Date': 'Thu, 19 Jul 2018 02:53:04 GMT',
        'Content-Type': 'application/json',
        'User-Agent': 'ios/4.4.4',
      },
    };
    this.options = { ...defaultOptions, ...options };
  }
  async getArticles() {
    return this.fetch('/discovery/index', {
      pull_type: 2,
      launch_request: 0,
      user_id: 1000,
      article_stick_ids: [],
    });
  }
  async fetch(path: string, data?: any) {
    return super.post(`http://api.meipian.me/4.4${path}`, {
      data: { ...data, ...this.options.data },
      headers: this.options.headers,

    });
  }
}

(async () => {
  const result = await new Information().getArticles();
  console.log(JSON.stringify(result, null, 2));
})();
