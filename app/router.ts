import { Application } from 'egg';

export default ( app: Application ) => {
  const { controller, router } = app;
  router.get( '/user/login', controller.user.login );
  router.get( '/user/register', controller.user.register );
};
