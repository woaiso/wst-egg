import { EggAppConfig, PowerPartial } from 'egg';

// for config.{env}.ts
export type DefaultConfig = PowerPartial<EggAppConfig & BizConfig>;

// app special config scheme
export interface BizConfig {
  sourceUrl: string;
}

export default (appInfo: EggAppConfig) => {
  const config = {} as PowerPartial<EggAppConfig> & BizConfig;

  // override config from framework / plugin

  config.keys = appInfo.name + 'woaiso_sec_key_23832';

  // add your config here
  config.middleware = ['auth'];

  config.bodyParser = {
    enable: true,
    jsonLimit: '10mb',
  };

  config.security = {
    csrf: {
      enable: false,
      ignore: () => true,
    },
  };

  config.jwt = {
    jwtSecret: 'woaiso-local-secret',
    jwtExpire: '1 days',
    WhiteList: ['UserLogin'],
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.mongoose = {
    url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wst',
    options: {
      autoReconnect: true, // 自动连接
      reconnectTries: Number.MAX_VALUE, // 尝试重试连接:js最大值
      bufferMaxEntries: 0,
    },
  };

  return config;
};
