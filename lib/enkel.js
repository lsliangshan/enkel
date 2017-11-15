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
const lsHttp = require('./http.js');
const util = require('../util/index');
let config = require('./config/config');
const loader = require('../util/loader');
const controller = require('./controller/base');
global.ls = {}

module.exports = class {
  constructor (options = {}) {
    this.options = options;
    this.init()
  }

  init () {
    const root_path = this.options.root_path || process.env.root_path || process.cwd();
    const app_path = path.resolve(root_path, this.options.app_path || process.env.app_path || 'app');

    ls.controller = {}
    util.define(ls, 'root_path', root_path);
    util.define(ls, 'app_path', app_path);
    util.define(ls.controller, 'base', controller);
    // 缓存
    Object.defineProperty(ls, '_caches', {
      value: {},
      writable: true,
      configurable: false,
      enumerable: false
    });
  }

  loadConfigs () {
    // ls._caches.configs = util.extend(config, this.options.config, true)
    ls._caches.configs = Object.assign({}, config, this.options.config);
  }

  loadControllers () {
    const groups = config.groups;
    ls._caches.controllers = {};
    // groups.forEach(function (g) {
    //   console.log('.>>> load controller group: ', g);
    // })
    new loader(ls.app_path, groups)
  }

  createServer () {
    if (!this.server) {
      this.server = http.createServer(lsHttp);
    }
    this.server.listen(ls._caches.configs.app_port || 3000);
    util.define(ls, 'server', this.server);
    console.log(`服务已经启动: http://127.0.0.1:${ls._caches.configs.app_port}`);
  }

  run () {
    this.loadConfigs();
    // this.loadControllers();
    this.createServer();
  }
}
