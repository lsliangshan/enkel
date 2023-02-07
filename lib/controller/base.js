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
// const base = require('../base');
// const util = require('util');
const querystring = require('querystring');
const formidable = require('formidable');
const fs = require('fs');

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

const _upload = function (request, opts) {
  return new Promise((resolve, reject) => {
    let form = new formidable.IncomingForm();
    let files = [];
    let errorPath = '';
    let fileName = '';
    let filePath = '';
    opts.rename && (form.keepExtensions = true);
    opts.multiples && (form.multiples = opts.multiples);
    opts.uploadDir && (form.uploadDir = opts.uploadDir);
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir);
    }
    form
      .on('file', function (field, file) {
        let suffix = file.name.split('.').pop();
        fileName = file.name;
        filePath = file.path;
        if (opts.accept.split(';').indexOf(suffix) < 0) {
          // 文件格式不正确
          errorPath = file.path;
          reject(`文件格式不正确，只支持${opts.accept.split(';')}格式的文件`);
        } else if (Number(opts.size) < Number(file.size)) {
          errorPath = file.path;
          reject(`文件太大，请不要上传超过${opts.size / 1024 / 1024}M的文件`);
        }
        files.push([field, file]);
        if (errorPath !== '') {
          let _stat = fs.statSync(errorPath);
          if (_stat.isDirectory()) {
            // 删除目录
            fs.rmdir(errorPath, function () { });
          } else if (_stat.isFile()) {
            // 删除文件
            fs.unlink(errorPath, function () { });
          }
        } else {
          if (!opts.rename) {
            let newPath = `${opts.uploadDir.replace(/\/*$/, '')}/${fileName}`;
            if (fs.existsSync(newPath)) {
              let _stat2 = fs.statSync(newPath);
              if (_stat2.isDirectory()) {
                // 删除目录
                fs.rmdirSync(newPath);
              } else if (_stat2.isFile()) {
                // 删除文件
                fs.unlinkSync(newPath);
              }
            }
            fs.renameSync(filePath, newPath);
          }
          resolve({ filename: opts.rename ? filePath.split('/').pop() : fileName });
        }
      });

    form.parse(request, function (err) {
      if (err) {
        reject(err)
      }
      resolve(true);
    })
  })
};

const _form = function (request, opts) {
  return new Promise((resolve, reject) => {
    let form = new formidable.IncomingForm();
    let outObj = {
      file: null,
      fields: []
    }
    form.parse(request, (err, field, file) => {
      if (err) {
        reject(err)
      }
      outObj.file = file
      outObj.fields = field
      resolve(outObj)
    })
  })
}

module.exports = class {

  constructor(...args) {
    this.init(...args)
  }

  init () {
    this.request = enkel.request;
    this.response = enkel.response;
    this.Sequelize = enkel.Sequelize;
    this.redis = enkel.redis;
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
    let _query = url.parse(enkel.request.url, true).query;
    return name ? _query[name] : _query;
  }

  async post (name) {
    let postData = await _post(this.request);
    return (name ? postData[name] : postData);
  }

  async form (opts) {
    return await _form(this.request, opts).catch(() => { return {} })
  }

  async upload (opts) {
    return await _upload(this.request, opts);
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
