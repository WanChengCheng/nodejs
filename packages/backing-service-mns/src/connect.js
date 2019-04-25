/*
 * File: connect.js
 * File Created: Friday, 19th April 2019 5:08:20 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import MNS from '../vendor/aliyun-mns';

const connectMNS = () => ({
  accessKeyId, accessKeySecret, endpoint, apiVersion = '2015-06-06',
}) => new Promise((resolve, reject) => {
  if (!accessKeyId || !accessKeySecret || !endpoint) {
    reject(new Error('Missing critical arguments connecting to aliyun mns'));
  }
  const mns = new MNS({
    accessKeyId,
    secretAccessKey: accessKeySecret,
    endpoint,
    apiVersion,
  });

  resolve(mns);
});

export default connectMNS;
