import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/user/center', controller.user.center);
  router.post('/user/login', controller.user.login);
  router.post('/user/register', controller.user.register);
  router.get('/auth_routes', controller.auth.authRoutes);

  router.post('/dribbble_account/list', controller.dribbbleAccount.index);
  router.post('/dribbble_account/create', controller.dribbbleAccount.create);
  router.post('/dribbble_account/change_status', controller.dribbbleAccount.changeStatus);

  router.get('/automator/get_dribbble_account_info', controller.dribbbleAccount.getUserInfo);
  router.resources('dribbble_job', '/dribbble_job', controller.dribbbleJob);
  router.get('/automator/get_info', controller.automator.getInfo);
  router.post('/automator', controller.automator.create);
  router.post('/dribbble_task/list', controller.dribbble.fetchDribbbleTask);

  // 仅系统级别使用
  router.get('/system/initial_account', controller.system.initialDribbbleAccount);
  router.get('/system/fllow', controller.system.fllow);
  router.get('/notices', controller.user.notices);
};
