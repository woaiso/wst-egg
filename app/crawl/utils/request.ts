import axios, { AxiosRequestConfig } from 'axios';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.message = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url: string, options: AxiosRequestConfig) {
  // 默认配置
  const defaultOptions = {
    // proxy: {
    //   host: '127.0.0.1',
    //   port: 8888,
    // },
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    newOptions.headers = {
      Accept: 'application/json',
      ...newOptions.headers,
    };
  }
  return axios({
    url,
    ...newOptions,
  })
    .then(checkStatus)
    .then( (response) => response.data)
    .catch((e) => {
      return e;
    });
}
