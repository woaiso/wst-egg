import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  // 用户信息与登录相关
  router.get('/user/center', controller.user.center);
  router.post('/user/login', controller.user.login);
  router.post('/user/register', controller.user.register);
  router.get('/auth_routes', controller.auth.authRoutes);

  // 基础业务
  router.post('/dribbble_account/list', controller.dribbbleAccount.index);
  router.post('/dribbble_account/create', controller.dribbbleAccount.create);
  router.post('/dribbble_account/change_status', controller.dribbbleAccount.changeStatus);

  router.get('/automator/info', controller.automator.getInfo);
  router.post('/automator/create', controller.automator.create);

  router.post('/dribbble_job/create', controller.dribbbleJob.create);
  router.post('/dribbble_job/list', controller.dribbbleJob.list);
  router.post('/dribbble_job/update', controller.dribbbleJob.update);

  router.post('/dribbble_task/list', controller.dribbble.fetchDribbbleTask);

  // 仅系统级别使用
  router.get('/system/initial_account', controller.system.initialDribbbleAccount);
  router.get('/system/fllow', controller.system.fllow);
  router.get('/notices', controller.user.notices);
};
