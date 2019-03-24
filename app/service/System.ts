import { Service } from 'egg';

export default class SystemService extends Service {
  // 初始化启动
  async bootstrap() {
      this.ctx.service.automator.updateAutomatorInfoByName('dribbble');
      this.ctx.service.dribbble.bootstrap();
  }
}
