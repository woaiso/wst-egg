import BaseController from './base';
export default class AuthController extends BaseController {
  authRoutes() {
    return this.json({
      route: { '/automator/dribbble': { authority: ['admin', 'user'] } },
    });
  }
}
