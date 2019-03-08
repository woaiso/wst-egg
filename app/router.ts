import { Application } from 'egg';

export default ( app: Application ) => {
  const { controller, router } = app;
  router.post( '/user/login', controller.user.login );
  router.post( '/user/register', controller.user.register );
};
