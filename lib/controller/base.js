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
const url = require('url');
const base = require('../base');
const util = require('util');
const querystring = require('querystring');

const _post = function (request) {
  return new Promise((resolve, reject) => {
    let post = '';
    request.on('data', function (chunk) {
      post += chunk;
    });

    request.on('end', function () {
      post = querystring.parse(post);
      resolve(post);
    });

    request.on('error', function (err) {
      reject({})
    });
  });
};

module.exports = class {

  constructor (...args) {
    this.init(...args)
  }

  init () {
    this.request = enkel.request;
    this.response = enkel.response;

    this.response.setHeader('X-Powered-By', 'enkel');
  }

  models (model) {
    let _m = model.replace(/^\/*(.*)\/*$/, '$1');
    let _group = enkel._caches.configs.default_group;
    let _model = '';
    if (_m.indexOf('/') > -1) {
      _group = _m.split('/')[0];
      _model = _m.split('/')[1].replace(/^[a-z]/, function (item) {
          return item.toUpperCase();
      });
    }
    if (_model === '') {
      return null
    }
    return enkel._caches.models[_group][_model]
  }

  /**
   * 方法名不存在
   * @returns {*}
   * @private
   */
  __empty (arg) {
    return this.echo(`接口${arg.group}/${arg.controller}/${arg.action}不存在`);
  }

  get (name) {
    return url.parse(enkel.request.url, true).query;
  }

  async post (name) {
    let postData = await _post(this.request);
    return (name ? postData[name] : postData);
  }

  /**
   * 是否为GET请求
   * @returns {*|Boolean}
   */
  isGet () {
    return this.request.method.toUpperCase() === 'GET';
  }

  /**
   * 是否为POST请求
   * @returns {boolean}
   */
  isPost () {
    return this.request.method.toUpperCase() === 'POST';
  }

  /**
   * 是否为指定请求方式
   * @param method
   * @returns {boolean}
   */
  isMethod (method) {
    return this.request.method.toUpperCase() === method.toUpperCase();
  }

  isPjax () {
    return this.request.headers['x-pjax'] || false;
  }

  isAjax () {
    return this.request.headers['x-requested-with'] === 'XMLHttpRequest';
  }

  /**
   * 返回JSON格式的数据
   * @param data
   * @returns {*|{line, column}|number}
   */
  json (data, contentType, encoding) {
    let ct = contentType || "application/json";
    let ed = encoding || "UTF-8";
    this.response.setHeader("Content-Type", ct + ";charset=" + ed);
    return this.response.end(JSON.stringify(data));
  }

  /**
   * 返回文本
   * @param data
   * @param contentType
   * @param encoding
   * @returns {*|{line, column}|number}
   */
  echo (data, contentType, encoding) {
    let ct = contentType || "text/plain";
    let ed = encoding || "UTF-8";
    this.response.setHeader("Content-Type", ct + ";charset=" + ed);
    return this.response.end(data);
  }
}
