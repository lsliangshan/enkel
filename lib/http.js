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
const fs = require('fs');
const path = require('path');
const loader = require('../util/loader');
const router = require('./router');
const url = require('url');
module.exports = async function (ctx, ctx2) {
  // ls.http = ctx;
  // ls.ctx = ctx;
  enkel.request = ctx;
  enkel.response = ctx2
  enkel._caches.controllers = {};
  new loader(enkel.app_path, enkel._caches.configs.groups)

  let pathname = url.parse(enkel.request.url).pathname;
  let routes = router(pathname)
  let staticResourcePath = enkel._caches.configs.default_static;
  if ((';' + staticResourcePath.join(';')).toLowerCase().indexOf((';' + pathname.replace(/^\//, '').split('/')[0]).toLowerCase()) > -1) {
    // 访问静态资源
    let _path = path.join(enkel.root_path, pathname);
    enkel.response.setHeader("Content-Type", "text/plain;charset=UTF-8");
    if (!fs.existsSync(_path)) {
      return enkel.response.end('您访问的资源不存在');
    } else {
      return enkel.response.end(fs.readFileSync(_path));
    }
  } else {
    if (routes.length !== 0) {
      if (!enkel._caches.controllers[routes[0]]) {
        enkel.response.setHeader("Content-Type", "text/plain;charset=UTF-8");
        return enkel.response.end(`分组${routes[0]}不存在`)
      } else if (!enkel._caches.controllers[routes[0]][routes[1]]) {
        enkel.response.setHeader("Content-Type", "text/plain;charset=UTF-8");
        return enkel.response.end(`控制器${routes[1]}不存在`)
      } else if (!enkel._caches.controllers[routes[0]][routes[1]][`${routes[2]}Action`]) {
        enkel._caches.controllers[routes[0]][routes[1]]['__empty']({
          group: routes[0],
          controller: routes[1],
          action: routes[2]
        });
      } else {
        let _next = true;
        if (enkel._caches.controllers[routes[0]][routes[1]]['__before']) {
          await enkel._caches.controllers[routes[0]][routes[1]]['__before']({
            group: routes[0],
            controller: routes[1],
            action: routes[2]
          });
        } else {
          _next = true;
        }
        _next && enkel._caches.controllers[routes[0]][routes[1]][`${routes[2]}Action`]()
      }
    }
  }

  // ls._caches.controllers['Home']['index']['indexAction']();
}
