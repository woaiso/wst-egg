// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import GithubAuth from '../../../app/service/GithubAuth';
import IAuth from '../../../app/service/IAuth';
import User from '../../../app/service/User';

declare module 'egg' {
  interface IService {
    githubAuth: GithubAuth;
    iAuth: IAuth;
    user: User;
  }
}
