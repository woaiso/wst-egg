// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuthorization from '../../../app/service/Authorization';
import ExportUser from '../../../app/service/User';

declare module 'egg' {
  interface IService {
    authorization: ExportAuthorization;
    user: ExportUser;
  }
}
