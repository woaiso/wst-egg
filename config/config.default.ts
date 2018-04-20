import { EggAppConfig, PowerPartial } from 'egg';
import * as path from 'path';

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
  config.middleware = [];

  // add view template
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.nj': 'nunjucks',
    },
    root: [
      path.join( appInfo.baseDir, 'app/view' ),
    ].join( ',' ),
  };

  // add oauth
  config.passportGithub = {
    key: 'fcb96d56ff06bb5d60ca',
    secret: 'a69f15cdd71fc3defc8144d4a52c223b31c13be5',
    callbackURL: '/passport/github/callback',
    proxy: true,
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
  return config;
};
