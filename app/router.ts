import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/user/center', controller.user.center);
  router.post('/user/login', controller.user.login);
  router.post('/user/register', controller.user.register);
  router.get('/auth_routes', controller.auth.authRoutes);
  router.resources(
    'dribbble_account',
    '/dribbble_account',
    controller.dribbbleAccount,
  );
  router.get('/automator/get_dribbble_account_info', controller.dribbbleAccount.getUserInfo);
  router.resources('dribbble_job', '/dribbble_job', controller.dribbbleJob);
  router.get('/automator/dribbble', controller.automator.show);
  router.post('/automator', controller.automator.create);
  router.get('/automator/dribbble_task', controller.dribbble.fetchDribbbleTask);
};
