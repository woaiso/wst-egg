import { Service } from 'egg';

/**
 * 自动化工具服务
 */
export default class AutomatorService extends Service {
  /**
   * 使用名称查询自动化工具的信息
   * @param automatorName 自动化工具名称
   */
  async findAutomatorInfoByName(automatorName: string) {
    return this.ctx.model.Automator.findOne({ name: { $eq: automatorName } });
  }
  /**
   * 插入一条自动化工具
   * @param automator 自动化工具
   */
  async insertAutomator(automator) {
    if (await this.checkAutomatorNameExsist(automator.name)) {
      throw new Error(`已存在该工具:${automator.name}`);
    } else {
      return this.ctx.model.Automator.create(automator);
    }
  }

  /**
   * 查询自动化工具是否存在
   * @param automatorName 自动化工具名称
   */
  async checkAutomatorNameExsist(automatorName) {
    return this.ctx.model.Automator.findOne({
      name: { $eq: automatorName },
    }).count();
  }
}
