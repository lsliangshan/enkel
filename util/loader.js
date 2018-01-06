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
const fs = require('fs');
module.exports = class {
  constructor (loadPath, groups, type) {
    this.init(loadPath, groups, type);
  }

  init (loadPath, groups, type) {
    const that = this
    const _groups = groups || enkel._caches.configs.groups;
    const objStr = Object.prototype.toString;
    if (objStr.call(_groups) === '[object Array]' && _groups.length > 0) {
      _groups.forEach(function (g) {
        if (type === 'models') {
          // 加载 model
          let cls2 = that.walk(`${loadPath}/${g}/model`);
          if (!enkel._caches.models.hasOwnProperty(g)) {
            enkel._caches.models[g] = {};
            cls2.forEach(function (model) {
              let tempModel = require(`${model}`);
              let _basename = path.basename(model, '.js');
              let modelName = _basename.replace(/^[a-zA-Z]/, function (item) {
                  return item.toUpperCase()
              });
              enkel._caches.models[g][modelName] = enkel.db.define(_basename, tempModel.fields);
              enkel._caches.models[g][modelName].sync({force: !tempModel.safe})
            })
          }
        } else {
          // 加载 控制器
          let cls = that.walk(`${loadPath}/${g}/controller`);
          if (!enkel._caches.controllers.hasOwnProperty(g)) {
            enkel._caches.controllers[g] = {}
            cls.forEach(function (ctrl) {
              let tempCtrl = require(`${ctrl}`);
              let ctrlName = path.basename(ctrl, '.js');
              enkel._caches.controllers[g][ctrlName] = new tempCtrl();
            });
          }
        }
      });
    }
  }

  /**
   * loop load
   *
   * @param {any} dir
   * @param {boolean} [skip=false]
   * @returns
   */
  walk(dir, skip = false) {
    dir = path.resolve(this.loadPath, dir);
    const exist = fs.existsSync(dir);
    if (!exist) {
      return;
    }

    const files = fs.readdirSync(dir);
    let list = [],
      p;

    for (var _iterator2 = files, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      let file = _ref2;

      p = fs.statSync(path.resolve(dir, file));
      if (!skip && p.isFile()) {
        list.push(path.resolve(dir, file));
      } else if (p.isDirectory()) {
        list = list.concat(this.walk(path.resolve(dir, file), false));
      }
    }

    return list;
  }
}
