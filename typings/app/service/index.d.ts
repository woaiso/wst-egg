// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAutomator from '../../../app/service/Automator';
import ExportCounter from '../../../app/service/Counter';
import ExportDribbble from '../../../app/service/Dribbble';
import ExportSystem from '../../../app/service/System';
import ExportUser from '../../../app/service/User';
import ExportCrawlerBase from '../../../app/service/crawler/base';
import ExportWorkerDribbble from '../../../app/service/worker/dribbble';

declare module 'egg' {
  interface IService {
    automator: ExportAutomator;
    counter: ExportCounter;
    dribbble: ExportDribbble;
    system: ExportSystem;
    user: ExportUser;
    crawler: {
      base: ExportCrawlerBase;
    }
    worker: {
      dribbble: ExportWorkerDribbble;
    }
  }
}
