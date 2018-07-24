import Spider from './spider';
/**
 * 聊天类蜘蛛
 */

interface IChat {
  objectId: string;
  sender: string;
  createAt: Date;
}
/**
 * 会话信息
 */
interface IMessage {
  /**
   * 消息内容
   */
  message: string;
  dialogue: string;
  avatar: number;
  color: number;
  blessed: boolean;
  senderId: string;
  s: boolean;
  createdAt: string;
  updatedAt: string;
  objectId: string;
  __type: string;
  className: string;
}

export default class ChatSpider extends Spider {
  // 参数配置
  options: any;
  constructor(options = {}) {
    super();
    const defaultOptions = {
      // 通用请求参数
      commonRequestDatas: {
        v: 10001,
        _ApplicationId: 'fUEmHsDqbr9v73s4JBx0CwANjDJjoMcDFlrGqgY5',
        _ClientVersion: 'js1.10.0',
        _InstallationId: '64aa918f-b1ec-750a-0f7c-841d72037e19',
      },
    };
    this.options = { ...defaultOptions, ...options };
  }
  /**
   * 登录聊天系统
   *
   * @param {string} userName 账户
   * @param {string} password 密码
   * @returns
   * @memberof ChatSpider
   */
  async login(userName: string, password: string) {
    return this.fetch('/login', {
      username: userName,
      password,
      _method: 'GET',
    });
  }
  /**
   * 检查用户是否存在
   *
   * @param {number} areaCode 国际区号 {86:中国}
   * @param {number} phoneNumber 电话号码
   * @returns
   * @memberof ChatSpider
   */
  async checkUserExsist(
    areaCode: number,
    phoneNumber: string
  ): Promise<boolean> {
    try {
      const result = await this.fetch('/functions/getUsernameByPhone', {
        phone: `${areaCode}${phoneNumber}`,
      });
      if (result.code === 1000) {
        return Promise.resolve(result.code === 1000);
      } else {
        return Promise.reject(false);
      }
    } catch (e) {
      return Promise.reject(false);
    }
  }
  /**
   * 获取聊天信息包含群组与个人
   */
  async getUserChats(): Promise<IChat[]> {
    return this.fetch('/functions/getMyChats', {
      laterThen: { iso: new Date().toString(), __type: 'Date' },
    });
  }
  async getUserDataByID(userId: string) {
    return this.fetch('/functions/getUserData', {
      userId,
    });
  }
  /**
   * 根据会话ID查询对话内容，最多查询到最近50条记录
   * @param dialogueId 会话ID
   */
  async getDialogueById(dialogueId: string): Promise<IMessage[]> {
    return this.fetch('/functions/getDialogue', {
      dialogueId,
    });
  }
  private async fetch(path: string, data?: any) {
    return super.post(`https://mobile-elb.antich.at${path}`, {
      ...data,
      ...this.options.commonRequestDatas,
    });
  }
}
