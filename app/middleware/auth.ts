const jwt = require('jsonwebtoken');

export default () => {
  return async function auth(ctx, next) {
    const { path } = ctx.request;
    // 登录和注册的请求放过
    if (path !== '/user/login' && path !== '/user/register') {
      let { authorization } = ctx.request.header;
      if (authorization === undefined) {
        ctx.body = { code: 401, message: '令牌为空，请登录获取！' };
        ctx.status = 401;
        return;
      }
      authorization = authorization.replace(/^Bearer\s/, '');
      try {
        jwt.verify(authorization, ctx.app.config.jwt.jwtSecret, {
          expiresIn: ctx.app.config.jwt.jwtExpire,
        });
        await next();
      } catch (err) {
        ctx.body = { code: 401, message: '访问令牌鉴权无效，请重新登录获取！' };
        ctx.status = 401;
      }
    } else {
      await next();
    }
  };
};
