/***
 **                                                          _ooOoo_
 **                                                         o8888888o
 **                                                         88" . "88
 **                                                         (| -_- |)
 **                                                          O\ = /O
 **                                                      ____/`---'\____
 **                                                    .   ' \\| |// `.
 **                                                     / \\||| : |||// \
 **                                                   / _||||| -:- |||||- \
 **                                                     | | \\\ - /// | |
 **                                                   | \_| ''\---/'' | |
 **                                                    \ .-\__ `-` ___/-. /
 **                                                 ___`. .' /--.--\ `. . __
 **                                              ."" '< `.___\_<|>_/___.' >'"".
 **                                             | | : `- \`.;`\ _ /`;.`/ - ` : | |
 **                                               \ \ `-. \_ __\ /__ _/ .-` / /
 **                                       ======`-.____`-.___\_____/___.-`____.-'======
 **                                                          `=---='
 **
 **                                       .............................................
 **                                              佛祖保佑             永无BUG
 **                                      佛曰:
 **                                              写字楼里写字间，写字间里程序员；
 **                                              程序人员写程序，又拿程序换酒钱。
 **                                              酒醒只在网上坐，酒醉还来网下眠；
 **                                              酒醉酒醒日复日，网上网下年复年。
 **                                              但愿老死电脑间，不愿鞠躬老板前；
 **                                              奔驰宝马贵者趣，公交自行程序员。
 **                                              别人笑我忒疯癫，我笑自己命太贱；
 **                                              不见满街漂亮妹，哪个归得程序员？
 */
/**
 * Created by liangshan on 2017/11/14.
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
const lsHttp = require('./http.js');
const util = require('../util/index');
let config = require('./config/config');
const loader = require('../util/loader');
const controller = require('./controller/base');
global.enkel = {}

module.exports = class {
  constructor (options = {}) {
    this.options = options;
    this.init()
  }

  init () {
    const root_path = this.options.root_path || process.env.root_path || process.cwd();
    const app_path = path.resolve(root_path, this.options.app_path || process.env.app_path || 'app');

    enkel.controller = {}
    util.define(enkel, 'axios', axios.create({
      transformRequest: [function (data, headers) {
        return querystring.stringify(data);
      }]
    }));
    util.define(enkel, 'root_path', root_path);
    util.define(enkel, 'app_path', app_path);
    util.define(enkel.controller, 'base', controller);
    // 缓存
    Object.defineProperty(enkel, '_caches', {
      value: {},
      writable: true,
      configurable: false,
      enumerable: false
    });
  }

  loadConfigs () {
    enkel._caches.configs = Object.assign({}, config, this.options.config);
  }

  loadControllers () {
    const groups = config.groups;
    enkel._caches.controllers = {};
    new loader(enkel.app_path, groups)
  }

  loadModels () {
      const groups = config.groups;
      enkel._caches.models = {};
      new loader(enkel.app_path, groups, 'models')
  }

  loadDb () {
    let _dbConfig = enkel._caches.configs.db;
    if (_dbConfig.ban) {
        return;
    }
    const Sequelize = require('sequelize');
    util.define(enkel, 'Sequelize', Sequelize);
    util.define(enkel, 'db', new Sequelize(_dbConfig.db_name, _dbConfig.username, _dbConfig.password, {
      host: _dbConfig.host,
      dialect: _dbConfig.type,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }));

    this.loadModels()
  }

  loadRedis () {
    let _redisConfig = enkel._caches.configs.redis;
    if (_redisConfig.ban) {
      return;
    }

    const redis = require('redis');
    util.define(enkel, 'redis', redis.createClient({
      host: _redisConfig.host,
      port: _redisConfig.port,
      password: _redisConfig.password
    }))
  }

  createServer () {
    if (!this.server) {
      this.server = http.createServer(lsHttp);
    }
    this.server.listen(enkel._caches.configs.app_port || 3000);
    util.define(enkel, 'server', this.server);
    console.log(`服务已经启动: http://127.0.0.1:${enkel._caches.configs.app_port}`);
  }

  createSocketServer () {
    let _socketConfig = enkel._caches.configs.socket;
    if (_socketConfig.ban) {
      return;
    }

    let app = http.createServer();
    let io = require('socket.io')(app, {
      path: _socketConfig.namespace,
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
    });
    // let subNamespace = io.of(_socketConfig.namespace);
    app.listen(_socketConfig.port);

    util.define(enkel, 'socket', {
      server: app,
      users: []
    });

    console.log(`socket服务已经启动: http://127.0.0.1:3010`);

    io.on('connect', function (socket) {
      let _query = socket.handshake.query;
      if (enkel.socket.users.indexOf(_query[_socketConfig.userKey]) < 0) {
        enkel.socket.users.push(_query[_socketConfig.userKey]);
      }
      _socketConfig.events.forEach((evt) => {
        socket.on(evt, function (data) {
          socket.broadcast.emit(evt, data);
        });
      });
    });
    // io.on('disconnect', function (socket) {
    //   socket.disconnect(true);
    // })
  }

  run () {
    this.loadConfigs();
    this.loadDb();
    this.loadRedis();
    this.createServer();
    this.createSocketServer();
  }
}
