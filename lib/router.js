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
 * Created by liangshan on 2017/11/15.
 */
const url = require('url');

const formatParams = function (query) {
  if (query.indexOf('=') < 0) {
    return {};
  }
  let outParams = {};
  query.split('&').forEach(function (item) {
    let tempParam = item.split('=');
    if (!outParams.hasOwnProperty(tempParam[0])) {
      outParams[tempParam[0]] = tempParam[1];
    }
  });

  return outParams;
};

module.exports = function (pathname) {
  if (pathname === '/favicon.ico') {
    return [];
  }
  let pn = pathname.replace(/^\/(.*)/, '$1')
  if (!pn) {
    pn = []
  } else {
    pn = pn.split('/');
  }
  let _configs = enkel._caches.configs
  if (pn.length === 0) {
    pn = [_configs.default_group, _configs.default_controller, _configs.default_action];
  } else if (pn.length === 1) {
    pn = [_configs.default_group, _configs.default_controller].concat(pn);
  } else if (pn.length === 2) {
    pn = [_configs.default_group].concat(pn);
  } else if (pn.length === 3) {

  }
  console.log('\x1B[36m%s\x1B[39m', '加载路由', '/' + pn.join('/'));
  return pn;
}