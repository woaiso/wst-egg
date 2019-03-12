// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccountMock from '../../../app/controller/account_mock';
import ExportAuth from '../../../app/controller/auth';
import ExportAutomator from '../../../app/controller/automator';
import ExportDribbble from '../../../app/controller/dribbble';
import ExportDribbbleAccount from '../../../app/controller/dribbble_account';
import ExportJobMock from '../../../app/controller/job_mock';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    accountMock: ExportAccountMock;
    auth: ExportAuth;
    automator: ExportAutomator;
    dribbble: ExportDribbble;
    dribbbleAccount: ExportDribbbleAccount;
    jobMock: ExportJobMock;
    user: ExportUser;
  }
}
