import { EggAppConfig, PowerPartial } from 'egg';

// for config.{env}.ts
export type DefaultConfig = PowerPartial<EggAppConfig & BizConfig>;

// app special config scheme
export interface BizConfig {
  sourceUrl: string;
}

export default ( appInfo: EggAppConfig ) => {
  const config = {} as PowerPartial<EggAppConfig> & BizConfig;

  // app special config
  config.sourceUrl = `https://github.com/eggjs/examples/tree/master/${appInfo.name}`;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1524105246005_4275';

  // add your config here
  config.middleware = [
    'auth',
  ];

  config.bodyParser = {
    enable: true,
    jsonLimit: '10mb',
  };

  config.mongo = {
    client: {
      host: [ '127.0.0.1' ], // or ['host']
      port: [ 27017 ], // or ['port1', 'port2']
      name: '',
      options: {
        replicaSet: 'test',
      },
    },
  };

  config.security =  {
    csrf: {
      enable: false,
      ignore: () => true,
    },
  };

  config.jwt = {
    jwtSecret: 'woaiso-local-secret',
    jwtExpire: '14 days',
    WhiteList: ['UserLogin'],
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return config;
};
