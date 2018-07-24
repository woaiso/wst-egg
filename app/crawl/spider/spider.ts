import { AxiosRequestConfig } from 'axios';
import httpRequest from '../utils/request';
/**
 * 蜘蛛基础类
 */
export default abstract class Spider {
  /**
   * 发送POST请求
   *
   * @param {string} url 请求的URL地址
   * @param {*} config 请求的参数
   * @returns
   * @memberof Spider
   */
  protected async post(url: string, config?: AxiosRequestConfig) {
    return this.request(url, { ...config, method: 'POST' });
  }
  /**
   * 发送GET请求
   *
   * @param {string} url 请求的URL地址
   * @param {*} config 请求的参数
   * @returns
   * @memberof Spider
   */
  protected async get(url: string, config?: AxiosRequestConfig) {
    return this.request(url, { ...config, method: 'GET' });
  }
  /**
   * 发送网络请求
   * @param {string} url 请求的URL地址
   * @param {*} config 请求的参数
   * @returns Promise<T>
   * @memberof Spider
   */
  protected async request<T = any>(url: string, config: AxiosRequestConfig): Promise<T> {
    return httpRequest(url, config);
  }
}
