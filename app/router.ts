import { Application } from 'egg';

export default ( app: Application ) => {
  const { controller, router } = app;
  router.get('/user/center', controller.user.center);
  router.post( '/user/login', controller.user.login );
  router.post( '/user/register', controller.user.register );
  router.get('/auth_routes', controller.auth.authRoutes);
  router.get('/automator/dribbble_info', controller.dribbble.dribbbleInfo);
  router.get('/automator/dribbble_job', controller.dribbble.fetchJobs);
  router.get('/automator/dribbble_account', controller.dribbble.fetchAccount);
};
