/*
 * @Author: zyc
 * @Date:   2016-01-22 22:43:34
 * @Last Modified by:   zyc
 * @Last Modified time: 2016-01-23 01:27:14
 */

const parser = require('xml2js').parseString;
const { fetchUrl } = require('fetch');

module.exports = (url, options, handle, callback = () => {}) => new Promise((resolve, reject) => {
  fetchUrl(url, options, (err, res, buf) => {
    if (err) {
      callback(err);
      return reject(err);
    }
    const { status } = res;
    parser(buf.toString(), (error, json) => {
      if (error) {
        error.status = status;
        callback(error);
        return reject(error);
      }
      const data = handle(json, res);
      callback(null, data);
      resolve(data);
    });
  });
});