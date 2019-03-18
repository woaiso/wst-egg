import axios from 'axios';

// tslint:disable-next-line:max-line-length
const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36`;

export default async function request(options): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const defaultOptions = {
      method: 'GET',
      maxRedirects: 0,
      validateStatus: (status: number) => {
        return (status >= 200 && status < 300) || status === 302; // default
      },
      headers: {
        referer: options.url,
        'X-Forwarded-For': '121.168.0.' + Math.ceil(Math.random() * 200) + 10,
        'User-Agent': userAgent,
      },
    };
    const newOptions = { ...defaultOptions, ...options };
    axios.request(newOptions).then(
      res => {
        // if (res.status === 302) {
        // request({ url: res.headers.location }).then(resolve, reject);
        // } else {
        resolve(res);
        // }
      },
      err => reject(err)
    );
  });
}
