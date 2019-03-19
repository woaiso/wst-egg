// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuth from '../../../app/controller/auth';
import ExportAutomator from '../../../app/controller/automator';
import ExportDribbble from '../../../app/controller/dribbble';
import ExportDribbbleAccount from '../../../app/controller/dribbble_account';
import ExportDribbbleJob from '../../../app/controller/dribbble_job';
import ExportJobMock from '../../../app/controller/job_mock';
import ExportSystem from '../../../app/controller/system';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    auth: ExportAuth;
    automator: ExportAutomator;
    dribbble: ExportDribbble;
    dribbbleAccount: ExportDribbbleAccount;
    dribbbleJob: ExportDribbbleJob;
    jobMock: ExportJobMock;
    system: ExportSystem;
    user: ExportUser;
  }
}
