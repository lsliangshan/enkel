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
 * Created by liangshan on 2017/11/13.
 */
const co = require('co');
const lodash = require('lodash');
/**
 * Object.defineProperty
 *
 * @param {any} obj
 * @param {any} property
 * @param {any} value
 * @param {boolean} [setter=false]
 * @returns
 */
const define = function (obj, property, value, setter = false) {
  if (setter) {
    return Object.defineProperty(obj, property, {
      value: value,
      writable: true,
      configurable: false,
      enumerable: true
    });
  } else {
    return Object.defineProperty(obj, property, {
      get: function () {
        return value;
      },
      configurable: false,
      enumerable: true
    });
  }
};

/**
 *
 *
 * @param {any} obj
 * @returns
 */
const isGenerator = function (obj) {
  return !!(obj && typeof obj === 'function' && obj.constructor && obj.constructor.name === 'GeneratorFunction');
}

/**
 * 将generator函数通过co转换为promise
 *
 * @param {Function} fn
 */
const generatorToPromise = function (fn) {
  if (typeof fn !== 'function') {
    throw Error('fn is not a function');
  }
  if (!isGenerator(fn)) {
    // assume it's Promise-based
    return fn;
  }
  return co.wrap(fn);
}

/**
 * 继承
 *
 * @param {any} source
 * @param {any} target
 * @param {any} deep
 * @returns
 */
const extend = function (source, target, deep = false) {
  if (deep) {
    return lodash.merge(lodash.cloneDeep(source), target);
  } else {
    return lodash.assignIn(source, target);
  }
}

/**
 * 检查对象是否为空
 * undefined,null,'',NaN,[],{}和任何空白字符，包括空格、制表符、换页符等等，均返回true
 * @param {*} obj
 * @returns {boolean}
 */
const isEmpty = function (obj) {
  const objStr = Object.prototype.toString;
  if (obj === undefined || obj === null || obj === '') {
    return true;
  } else if (typeof obj === 'string') {
    //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
    return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
  }
  // else if (lib.isNumber(obj)) {
  //   return isNaN(obj);
  // }
  else if (objStr.call(obj) === '[object Array]') {
    return obj.length === 0;
  } else if (objStr.call(obj) === '[object Object]') {
    for (let key in obj) {
      return !key && !0;
    }
    return true;
  }
  return false;
}

module.exports = {
  define: define,
  isGenerator: isGenerator,
  generatorToPromise: generatorToPromise,
  extend: extend,
  isEmpty: isEmpty
}